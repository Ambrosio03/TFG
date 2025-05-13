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

class CartController extends AbstractController
{
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
                        'imagen' => $product->getImagen()
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

    #[Route("/cart/add", name: "cart_add", methods: ["POST"])]
    public function add(Request $request, EntityManagerInterface $entityManager): Response
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['product_id']) || !isset($data['quantity']) || !isset($data['user_id'])) {
            return $this->json(['error' => 'Datos incompletos: se requiere product_id, quantity y user_id'], Response::HTTP_BAD_REQUEST);
        }

        $product = $entityManager->getRepository(Product::class)->find($data['product_id']);
        if (!$product) {
            return $this->json(['error' => 'Producto no encontrado'], Response::HTTP_NOT_FOUND);
        }

        $user = $entityManager->getRepository(User::class)->find($data['user_id']);
        if (!$user) {
            return $this->json(['error' => 'Usuario no encontrado'], Response::HTTP_NOT_FOUND);
        }

        // Verificar si el usuario ya tiene un carrito pendiente
        $existingCart = $entityManager->getRepository(Cart::class)->findOneBy(['user' => $user, 'estado' => 'pendiente']);
        
        if (!$existingCart) {
            // Si no existe un carrito pendiente, crear uno nuevo
            $existingCart = new Cart();
            $existingCart->setUser($user);
            $existingCart->setEstado('pendiente');
            $entityManager->persist($existingCart);
        }

        // Buscar si el producto ya está en el carrito
        $existingItem = null;
        foreach ($existingCart->getItems() as $item) {
            if ($item->getProduct()->getId() === $product->getId()) {
                $existingItem = $item;
                break;
            }
        }

        if ($existingItem) {
            // Si el producto ya está en el carrito, sumar la cantidad
            $existingItem->setQuantity($existingItem->getQuantity() + $data['quantity']);
        } else {
            // Si el producto no está en el carrito, crear un nuevo item
            $cartItem = new CartItem();
            $cartItem->setProduct($product);
            $cartItem->setQuantity($data['quantity']);
            $existingCart->addItem($cartItem);
        }

        $entityManager->flush();

        // Devolver los datos actualizados del carrito con toda la información de los productos
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
                    'stock' => $product->getStock()
                ]
            ];
        }, $existingCart->getItems()->toArray());

        return $this->json([
            'cart_id' => $existingCart->getId(),
            'items' => $items
        ]);
    }

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
} 