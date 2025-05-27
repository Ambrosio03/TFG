<?php

namespace App\Controller;

use App\Entity\Pedido;
use App\Entity\PedidoItem;
use App\Entity\Cart;
use App\Entity\CartItem;
use App\Entity\Product;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class PedidoController extends AbstractController
{
    #[Route("/pedidos", name: "pedido_index", methods: ["GET"])]
    public function index(EntityManagerInterface $entityManager): Response
    {
        $pedidos = $entityManager->getRepository(Pedido::class)->findAll();
        
        $data = array_map(function($pedido) {
            return [
                'id' => $pedido->getId(),
                'usuario_id' => $pedido->getUsuario()->getId(),
                'nombre_cliente' => $pedido->getUsuario()->getNombreUsuario(),
                'estado' => $pedido->getEstado(),
                'fecha_creacion' => $pedido->getFechaCreacion()->format('Y-m-d H:i:s'),
                'fecha_envio' => $pedido->getFechaEnvio() ? $pedido->getFechaEnvio()->format('Y-m-d H:i:s') : null,
                'fecha_entrega' => $pedido->getFechaEntrega() ? $pedido->getFechaEntrega()->format('Y-m-d H:i:s') : null,
                'total' => $pedido->getTotal(),
                'items' => array_map(function($item) {
                    return [
                        'id' => $item->getId(),
                        'producto_id' => $item->getProducto()->getId(),
                        'cantidad' => $item->getCantidad(),
                        'precio_unitario' => $item->getPrecioUnitario()
                    ];
                }, $pedido->getItems()->toArray())
            ];
        }, $pedidos);

        return $this->json($data);
    }

    #[Route("/pedidos/{id}", name: "pedido_show", methods: ["GET"])]
    public function show(int $id, EntityManagerInterface $entityManager): Response
    {
        $pedido = $entityManager->getRepository(Pedido::class)->find($id);

        if (!$pedido) {
            return $this->json(['error' => 'Pedido no encontrado'], Response::HTTP_NOT_FOUND);
        }

        // Información del usuario
        $usuario = $pedido->getUsuario();
        $usuarioData = [
            'id' => $usuario->getId(),
            'nombre_usuario' => $usuario->getNombreUsuario(),
            'email' => $usuario->getEmail(),
        ];

        // Información de los items con detalles del producto
        $items = array_map(function($item) {
            $producto = $item->getProducto();
            return [
                'id' => $item->getId(),
                'producto_id' => $producto->getId(),
                'nombre_producto' => $producto->getNombre(),
                'precio_unitario' => $item->getPrecioUnitario(),
                'cantidad' => $item->getCantidad(),
                'imagen' => $producto->getImagen(),
            ];
        }, $pedido->getItems()->toArray());

        return $this->json([
            'id' => $pedido->getId(),
            'usuario' => $usuarioData,
            'estado' => $pedido->getEstado(),
            'fecha_creacion' => $pedido->getFechaCreacion()->format('Y-m-d H:i:s'),
            'fecha_envio' => $pedido->getFechaEnvio() ? $pedido->getFechaEnvio()->format('Y-m-d H:i:s') : null,
            'fecha_entrega' => $pedido->getFechaEntrega() ? $pedido->getFechaEntrega()->format('Y-m-d H:i:s') : null,
            'total' => $pedido->getTotal(),
            'items' => $items
        ]);
    }

    #[Route("/pedidos/crear", name: "pedido_create", methods: ["POST"])]
    public function create(Request $request, EntityManagerInterface $entityManager): Response
    {
        try {
            $data = json_decode($request->getContent(), true);

            // Validación más detallada de los datos recibidos
            if (empty($data)) {
                return $this->json([
                    'error' => 'No se recibieron datos en la petición',
                    'detalles' => 'El cuerpo de la petición está vacío'
                ], Response::HTTP_BAD_REQUEST);
            }

            if (!isset($data['user_id'])) {
                return $this->json([
                    'error' => 'Se requiere el ID del usuario',
                    'detalles' => 'El campo user_id es obligatorio en la petición',
                    'datos_recibidos' => $data
                ], Response::HTTP_BAD_REQUEST);
            }

            $user = $entityManager->getRepository(User::class)->find($data['user_id']);
            if (!$user) {
                return $this->json([
                    'error' => 'Usuario no encontrado',
                    'detalles' => 'No existe un usuario con el ID proporcionado: ' . $data['user_id']
                ], Response::HTTP_NOT_FOUND);
            }

            // Buscar el carrito activo del usuario
            $cart = $entityManager->getRepository(Cart::class)->findOneBy([
                'user' => $user,
                'estado' => 'pendiente'
            ]);

            if (!$cart) {
                return $this->json([
                    'error' => 'No hay carrito activo',
                    'detalles' => 'El usuario no tiene un carrito pendiente'
                ], Response::HTTP_BAD_REQUEST);
            }

            if ($cart->getItems()->isEmpty()) {
                return $this->json([
                    'error' => 'Carrito vacío',
                    'detalles' => 'No hay productos en el carrito para procesar el pedido'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Crear el pedido
            $pedido = new Pedido();
            $pedido->setUsuario($user);
            $pedido->setEstado(Pedido::ESTADO_PENDIENTE);

            // Transferir items del carrito al pedido
            foreach ($cart->getItems() as $cartItem) {
                $producto = $cartItem->getProduct();
                
                // Verificar stock
                if ($cartItem->getQuantity() > $producto->getStock()) {
                    return $this->json([
                        'error' => 'Stock insuficiente',
                        'detalles' => 'No hay suficiente stock para el producto: ' . $producto->getNombre(),
                        'stock_disponible' => $producto->getStock(),
                        'cantidad_solicitada' => $cartItem->getQuantity()
                    ], Response::HTTP_BAD_REQUEST);
                }

                // Crear item del pedido
                $pedidoItem = new PedidoItem();
                $pedidoItem->setPedido($pedido);
                $pedidoItem->setProducto($producto);
                $pedidoItem->setCantidad($cartItem->getQuantity());
                $pedidoItem->setPrecioUnitario($producto->getPrecio());

                // Actualizar stock
                $producto->setStock($producto->getStock() - $cartItem->getQuantity());

                $pedido->addItem($pedidoItem);
            }

            // Calcular y establecer el total
            $pedido->setTotal($pedido->calcularTotal());

            // Persistir el pedido
            $entityManager->persist($pedido);
            
            // Eliminar el carrito
            $entityManager->remove($cart);
            
            $entityManager->flush();

            return $this->json([
                'message' => 'Pedido creado correctamente',
                'pedido_id' => $pedido->getId(),
                'estado' => $pedido->getEstado(),
                'total' => $pedido->getTotal(),
                'fecha_creacion' => $pedido->getFechaCreacion()->format('Y-m-d H:i:s')
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al procesar el pedido',
                'detalles' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route("/pedidos/{id}/estado", name: "pedido_update_estado", methods: ["PATCH"])]
    public function updateEstado(int $id, Request $request, EntityManagerInterface $entityManager): Response
    {
        $pedido = $entityManager->getRepository(Pedido::class)->find($id);

        if (!$pedido) {
            return $this->json(['error' => 'Pedido no encontrado'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['estado'])) {
            return $this->json(['error' => 'Se requiere el nuevo estado'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $pedido->setEstado($data['estado']);

            // Actualizar fechas según el estado
            switch ($data['estado']) {
                case Pedido::ESTADO_ENVIADO:
                    $pedido->setFechaEnvio(new \DateTime());
                    break;
                case Pedido::ESTADO_ENTREGADO:
                    $pedido->setFechaEntrega(new \DateTime());
                    break;
            }

            $entityManager->flush();

            return $this->json([
                'message' => 'Estado actualizado correctamente',
                'estado' => $pedido->getEstado()
            ]);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route("/pedidos/usuario/{userId}", name: "pedido_user", methods: ["GET"])]
    public function getPedidosUsuario(int $userId, EntityManagerInterface $entityManager): Response
    {
        $user = $entityManager->getRepository(User::class)->find($userId);
        if (!$user) {
            return $this->json(['error' => 'Usuario no encontrado'], Response::HTTP_NOT_FOUND);
        }

        $pedidos = $entityManager->getRepository(Pedido::class)->findBy(['usuario' => $user]);

        $data = array_map(function($pedido) {
            return [
                'id' => $pedido->getId(),
                'estado' => $pedido->getEstado(),
                'fecha_creacion' => $pedido->getFechaCreacion()->format('Y-m-d H:i:s'),
                'fecha_envio' => $pedido->getFechaEnvio() ? $pedido->getFechaEnvio()->format('Y-m-d H:i:s') : null,
                'fecha_entrega' => $pedido->getFechaEntrega() ? $pedido->getFechaEntrega()->format('Y-m-d H:i:s') : null,
                'total' => $pedido->getTotal(),
                'items' => array_map(function($item) {
                    return [
                        'id' => $item->getId(),
                        'producto_id' => $item->getProducto()->getId(),
                        'cantidad' => $item->getCantidad(),
                        'precio_unitario' => $item->getPrecioUnitario()
                    ];
                }, $pedido->getItems()->toArray())
            ];
        }, $pedidos);

        return $this->json($data);
    }

    #[Route("/pedidos/items/{pedidoId}", name: "pedido_items", methods: ["GET"])]
    public function getPedidoItems(int $pedidoId, EntityManagerInterface $entityManager): Response
    {
        try {
            $pedido = $entityManager->getRepository(Pedido::class)->find($pedidoId);

            if (!$pedido) {
                return $this->json([
                    'error' => 'Pedido no encontrado',
                    'detalles' => 'No existe un pedido con el ID proporcionado: ' . $pedidoId
                ], Response::HTTP_NOT_FOUND);
            }

            $items = array_map(function($item) use ($pedidoId) {
                $producto = $item->getProducto();
                return [
                    'id' => $item->getId(),
                    'pedido_id' => $pedidoId,
                    'producto' => [
                        'id' => $producto->getId(),
                        'nombre' => $producto->getNombre(),
                        'precio' => $producto->getPrecio(),
                        'imagen' => $producto->getImagen(),
                        'descripcion' => $producto->getDescripcion()
                    ],
                    'cantidad' => $item->getCantidad(),
                    'precio_unitario' => $item->getPrecioUnitario(),
                    'subtotal' => $item->getCantidad() * $item->getPrecioUnitario(),
                    'nombre_producto' => $producto->getNombre()
                ];
            }, $pedido->getItems()->toArray());

            return $this->json([
                'pedido_id' => $pedidoId,
                'estado' => $pedido->getEstado(),
                'total' => $pedido->getTotal(),
                'fecha_creacion' => $pedido->getFechaCreacion()->format('Y-m-d H:i:s'),
                'items' => $items
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al obtener los items del pedido',
                'detalles' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route("/pedidos/items", name: "pedido_items_all", methods: ["GET"])]
    public function getAllPedidoItems(EntityManagerInterface $entityManager): Response
    {
        try {
            $pedidos = $entityManager->getRepository(Pedido::class)->findAll();
            
            $resultado = [];
            foreach ($pedidos as $pedido) {
                $items = array_map(function($item) use ($pedido) {
                    $producto = $item->getProducto();
                    return [
                        'id' => $item->getId(),
                        'pedido_id' => $pedido->getId(),
                        'producto' => [
                            'id' => $producto->getId(),
                            'nombre' => $producto->getNombre(),
                            'precio' => $producto->getPrecio(),
                            'imagen' => $producto->getImagen(),
                            'descripcion' => $producto->getDescripcion()
                        ],
                        'cantidad' => $item->getCantidad(),
                        'precio_unitario' => $item->getPrecioUnitario(),
                        'subtotal' => $item->getCantidad() * $item->getPrecioUnitario(),
                        'nombre_producto' => $producto->getNombre()
                    ];
                }, $pedido->getItems()->toArray());

                $resultado[] = [
                    'pedido_id' => $pedido->getId(),
                    'estado' => $pedido->getEstado(),
                    'total' => $pedido->getTotal(),
                    'fecha_creacion' => $pedido->getFechaCreacion()->format('Y-m-d H:i:s'),
                    'items' => $items
                ];
            }

            return $this->json($resultado);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al obtener los items de los pedidos',
                'detalles' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route("/pedidos/mis-pedidos/{userId}", name: "pedido_mis_pedidos", methods: ["GET"])]
    public function getMisPedidos(int $userId, EntityManagerInterface $entityManager): Response
    {
        try {
            // Buscar el usuario por ID
            $user = $entityManager->getRepository(User::class)->find($userId);
            
            if (!$user) {
                return $this->json([
                    'error' => 'Usuario no encontrado',
                    'detalles' => 'No existe un usuario con el ID proporcionado'
                ], Response::HTTP_NOT_FOUND);
            }

            // Obtener los pedidos del usuario
            $pedidos = $entityManager->getRepository(Pedido::class)->findBy(
                ['usuario' => $user],
                ['fechaCreacion' => 'DESC']
            );

            $data = array_map(function($pedido) {
                return [
                    'id' => $pedido->getId(),
                    'estado' => $pedido->getEstado(),
                    'fecha_creacion' => $pedido->getFechaCreacion()->format('Y-m-d H:i:s'),
                    'fecha_envio' => $pedido->getFechaEnvio() ? $pedido->getFechaEnvio()->format('Y-m-d H:i:s') : null,
                    'fecha_entrega' => $pedido->getFechaEntrega() ? $pedido->getFechaEntrega()->format('Y-m-d H:i:s') : null,
                    'total' => $pedido->getTotal(),
                    'items' => array_map(function($item) {
                        $producto = $item->getProducto();
                        return [
                            'id' => $item->getId(),
                            'producto' => [
                                'id' => $producto->getId(),
                                'nombre' => $producto->getNombre(),
                                'precio' => $producto->getPrecio(),
                                'imagen' => $producto->getImagen(),
                                'descripcion' => $producto->getDescripcion()
                            ],
                            'cantidad' => $item->getCantidad(),
                            'precio_unitario' => $item->getPrecioUnitario(),
                            'subtotal' => $item->getCantidad() * $item->getPrecioUnitario(),
                            'nombre_producto' => $producto->getNombre()
                        ];
                    }, $pedido->getItems()->toArray())
                ];
            }, $pedidos);

            return $this->json([
                'total_pedidos' => count($pedidos),
                'pedidos' => $data
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al obtener los pedidos',
                'detalles' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 