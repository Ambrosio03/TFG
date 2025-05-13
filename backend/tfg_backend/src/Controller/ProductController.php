<?php

namespace App\Controller;

use App\Entity\Product;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Repository\ProductRepository;

class ProductController extends AbstractController
{
    #[Route("/product", name: "product_index", methods: ["GET"])]
    public function index(ProductRepository $productRepository): Response
    {
        $products = $productRepository->findVisibleProducts();

        $data = array_map(function($product) {
            return [
                'id' => $product->getId(),
                'nombre' => $product->getNombre(),
                'precio' => $product->getPrecio(),
                'stock' => $product->getStock(),
                'descripcion' => $product->getDescripcion(),
                'imagen' => $product->getImagen(),
                'visible' => $product->isVisible(),
            ];
        }, $products);

        return $this->json($data);
    }

    #[Route("/product", name: "product_create", methods: ["POST"])]
    public function create(Request $request, EntityManagerInterface $entityManager): Response
    {
        $data = json_decode($request->getContent(), true);

        $product = new Product();
        $product->setNombre($data['nombre']);
        $product->setPrecio($data['precio']);
        $product->setStock($data['stock']);
        $product->setDescripcion($data['descripcion']);

        $entityManager->persist($product);
        dump($product);
        $entityManager->flush();

        return $this->json($product);
    }

    #[Route("/product/{id}", name: "product_show", methods: ["GET"], requirements: ["id" => "\d+"])]
    public function show(int $id, EntityManagerInterface $entityManager): Response
    {
        $product = $entityManager->getRepository(Product::class)->find($id);

        if (!$product) {
            return $this->json(['error' => 'Producto no encontrado'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($product);
    }

    #[Route("/product/all", name: "product_all", methods: ["GET"])]
    public function all(ProductRepository $productRepository): Response
    {
        try {
            $products = $productRepository->findAll();
            $data = array_map(function($product) {
                return [
                    'id' => $product->getId(),
                    'nombre' => $product->getNombre(),
                    'precio' => $product->getPrecio(),
                    'stock' => $product->getStock(),
                    'descripcion' => $product->getDescripcion(),
                    'imagen' => $product->getImagen(),
                    'visible' => $product->isVisible(),
                ];
            }, $products);
            return $this->json($data);
        } catch (\Throwable $e) {
            return $this->json([
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    #[Route("/product/{id}", name: "product_edit", methods: ["PUT", "PATCH"], requirements: ["id" => "\\d+"])]
    public function edit(int $id, Request $request, EntityManagerInterface $entityManager): Response
    {
        $product = $entityManager->getRepository(Product::class)->find($id);

        if (!$product) {
            return $this->json(['error' => 'Producto no encontrado'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['nombre'])) $product->setNombre($data['nombre']);
        if (isset($data['precio'])) $product->setPrecio($data['precio']);
        if (isset($data['stock'])) $product->setStock($data['stock']);
        if (isset($data['descripcion'])) $product->setDescripcion($data['descripcion']);
        if (isset($data['imagen'])) $product->setImagen($data['imagen']);
        if (isset($data['visible'])) $product->setVisible($data['visible']);

        dump($product);
        $entityManager->flush();

        return $this->json([
            'message' => 'Producto actualizado correctamente',
            'producto' => [
                'id' => $product->getId(),
                'nombre' => $product->getNombre(),
                'precio' => $product->getPrecio(),
                'stock' => $product->getStock(),
                'descripcion' => $product->getDescripcion(),
                'imagen' => $product->getImagen(),
                'visible' => $product->isVisible(),
            ]
        ]);
    }

    #[Route("/product/{id}", name: "product_delete", methods: ["DELETE"], requirements: ["id" => "\d+"])]
    public function delete(int $id, EntityManagerInterface $entityManager): Response
    {
        $product = $entityManager->getRepository(Product::class)->find($id);

        if (!$product) {
            return $this->json(['error' => 'Producto no encontrado'], Response::HTTP_NOT_FOUND);
        }

        $entityManager->remove($product);
        $entityManager->flush();

        return $this->json(['message' => 'Producto eliminado correctamente']);
    }
}