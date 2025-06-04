<?php

namespace App\Controller;

use App\Entity\Cart;
use App\Entity\CartItem;
use App\Entity\Product;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Controlador para gestionar las operaciones del carrito de compras
 */
class CartController extends AbstractController
{
    /**
     * Obtiene el carrito pendiente de un usuario y sus productos
     * @param int $userId ID del usuario
     * @return Response Carrito y sus items
     */
    #[Route("/cart/{userId}", name: "cart_index", methods: ["GET"])]
    public function index(int $userId, EntityManagerInterface $entityManager): Response
    {
        try {
            $user = $entityManager->getRepository(User::class)->find($userId);
            if (!$user) {
                return $this->json(['error' => 'Usuario no encontrado'], Response::HTTP_NOT_FOUND);
            }

            $cart = $entityManager->getRepository(Cart::class)->findOneBy([
                'user' => $user,
                'estado' => 'pendiente'
            ]);

            if (!$cart) {
                return $this->json(['message' => 'No hay carrito pendiente para este usuario'], Response::HTTP_OK);
            }

            // Devolver los datos del carrito y sus productos
            $items = array_map(function($item) {
                $product = $item->getProduct();
                return [
                    'id' => $item->getId(),
                    'quantity' => $item->getQuantity(),
                    'product' => [
                        'id' => $product->getId(),
                        'nombre' => $product->getNombre(),
                        'precio' => $product->getPrecio(),
                        'descripcion' => $product->getDescripcion(),
                        'stock' => $product->getStock(),
                        'imagen' => $product->getImagen(),
                        'imagenes' => $product->getImagenes() ?? []
                    ]
                ];
            }, $cart->getItems()->toArray());

            return $this->json([
                'id' => $cart->getId(),
                'estado' => $cart->getEstado(),
                'user_id' => $cart->getUser()->getId(),
                'items' => $items
            ]);

        } catch (\Exception $e) {
            return $this->json(['error' => 'Error al recuperar el carrito'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    
    /**
     * Elimina un elemento del carrito
     * @param int $id ID del item del carrito
     * @return Response Mensaje de éxito o error
     */
    #[Route("/cart/remove/{id}", name: "cart_remove", methods: ["DELETE"])]
    public function remove(int $id, EntityManagerInterface $entityManager): Response
    {
        $cartItem = $entityManager->getRepository(CartItem::class)->find($id);

        if (!$cartItem) {
            return $this->json(['error' => 'Elemento del carrito no encontrado'], Response::HTTP_NOT_FOUND);
        }

        $entityManager->remove($cartItem);
        $entityManager->flush();

        return $this->json(['success' => 'Elemento eliminado del carrito']);
    }

    /**
     * Actualiza la cantidad de un producto en el carrito
     * @param int $id ID del item del carrito
     * @param Request $request Nueva cantidad
     * @return Response Item actualizado o error
     */
    #[Route("/cart/update/{id}", name: "cart_update", methods: ["PUT"])]
    public function updateQuantity(int $id, Request $request, EntityManagerInterface $entityManager): Response
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!isset($data['quantity']) || $data['quantity'] < 1) {
                return $this->json([
                    'error' => 'La cantidad debe ser un número positivo'
                ], Response::HTTP_BAD_REQUEST);
            }

            $cartItem = $entityManager->getRepository(CartItem::class)->find($id);

            if (!$cartItem) {
                return $this->json([
                    'error' => 'Elemento del carrito no encontrado'
                ], Response::HTTP_NOT_FOUND);
            }

            // Verificar si hay suficiente stock
            $product = $cartItem->getProduct();
            if ($data['quantity'] > $product->getStock()) {
                return $this->json([
                    'error' => 'No hay suficiente stock disponible',
                    'stock_disponible' => $product->getStock()
                ], Response::HTTP_BAD_REQUEST);
            }

            // Actualizar la cantidad
            $cartItem->setQuantity($data['quantity']);
            $entityManager->flush();

            // Devolver los datos actualizados del item
            return $this->json([
                'id' => $cartItem->getId(),
                'quantity' => $cartItem->getQuantity(),
                'product' => [
                    'id' => $product->getId(),
                    'nombre' => $product->getNombre(),
                    'precio' => $product->getPrecio(),
                    'descripcion' => $product->getDescripcion(),
                    'stock' => $product->getStock()
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al actualizar la cantidad'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Añade un producto al carrito de un usuario
     * @param Request $request Datos del usuario, producto y cantidad
     * @return Response Mensaje de éxito o error
     */
    #[Route("/cart/add", name: "cart_add", methods: ["POST"])]
    public function addToCart(Request $request, EntityManagerInterface $entityManager): Response
    {
        try {
            $data = json_decode($request->getContent(), true);

            // Validar datos requeridos
            if (!isset($data['user_id']) || !isset($data['product_id']) || !isset($data['quantity'])) {
                return $this->json([
                    'error' => 'Faltan datos requeridos',
                    'detalles' => 'Se requieren user_id, product_id y quantity'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Validar cantidad
            if ($data['quantity'] <= 0) {
                return $this->json([
                    'error' => 'Cantidad inválida',
                    'detalles' => 'La cantidad debe ser mayor a 0'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Buscar usuario
            $user = $entityManager->getRepository(User::class)->find($data['user_id']);
            if (!$user) {
                return $this->json([
                    'error' => 'Usuario no encontrado',
                    'detalles' => 'No existe un usuario con el ID proporcionado'
                ], Response::HTTP_NOT_FOUND);
            }

            // Buscar producto
            $product = $entityManager->getRepository(Product::class)->find($data['product_id']);
            if (!$product) {
                return $this->json([
                    'error' => 'Producto no encontrado',
                    'detalles' => 'No existe un producto con el ID proporcionado'
                ], Response::HTTP_NOT_FOUND);
            }

            // Verificar stock
            if ($data['quantity'] > $product->getStock()) {
                return $this->json([
                    'error' => 'Stock insuficiente',
                    'detalles' => 'No hay suficiente stock disponible',
                    'stock_disponible' => $product->getStock()
                ], Response::HTTP_BAD_REQUEST);
            }

            // Buscar carrito activo del usuario
            $cart = $entityManager->getRepository(Cart::class)->findOneBy([
                'user' => $user,
                'estado' => 'pendiente'
            ]);

            // Si no existe carrito activo, crear uno nuevo
            if (!$cart) {
                $cart = new Cart();
                $cart->setUser($user);
                $cart->setEstado('pendiente');
                $entityManager->persist($cart);
            }

            // Verificar si el producto ya está en el carrito
            $existingItem = null;
            foreach ($cart->getItems() as $item) {
                if ($item->getProduct()->getId() === $product->getId()) {
                    $existingItem = $item;
                    break;
                }
            }

            if ($existingItem) {
                // Actualizar cantidad del item existente
                $newQuantity = $existingItem->getQuantity() + $data['quantity'];
                
                // Verificar stock nuevamente con la cantidad total
                if ($newQuantity > $product->getStock()) {
                    return $this->json([
                        'error' => 'Stock insuficiente',
                        'detalles' => 'No hay suficiente stock disponible para la cantidad total',
                        'stock_disponible' => $product->getStock(),
                        'cantidad_actual' => $existingItem->getQuantity(),
                        'cantidad_solicitada' => $data['quantity']
                    ], Response::HTTP_BAD_REQUEST);
                }

                $existingItem->setQuantity($newQuantity);
            } else {
                // Crear nuevo item en el carrito
                $cartItem = new CartItem();
                $cartItem->setCart($cart);
                $cartItem->setProduct($product);
                $cartItem->setQuantity($data['quantity']);
                $entityManager->persist($cartItem);
            }

            $entityManager->flush();

            return $this->json([
                'message' => 'Producto añadido al carrito correctamente',
                'cart_id' => $cart->getId(),
                'estado' => $cart->getEstado()
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al añadir producto al carrito',
                'detalles' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
} 