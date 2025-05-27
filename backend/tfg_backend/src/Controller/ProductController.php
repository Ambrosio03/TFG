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
        try {
            $products = $productRepository->findVisibleProducts();

            $data = array_map(function($product) {
                try {
                    $imagenes = $product->getImagenes();
                    if (!is_array($imagenes)) {
                        $imagenes = [];
                    }
                    
                    return [
                        'id' => $product->getId(),
                        'nombre' => $product->getNombre(),
                        'precio' => $product->getPrecio(),
                        'stock' => $product->getStock(),
                        'descripcion' => $product->getDescripcion(),
                        'imagen' => $product->getImagen(),
                        'imagenes' => $imagenes,
                        'visible' => $product->isVisible(),
                    ];
                } catch (\Exception $e) {
                    return [
                        'error' => 'Error al procesar el producto: ' . $e->getMessage(),
                        'product_id' => $product->getId()
                    ];
                }
            }, $products);

            return $this->json($data);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al obtener los productos',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route("/product", name: "product_create", methods: ["POST"])]
    public function create(Request $request, EntityManagerInterface $entityManager): Response
    {
        try {
            $data = json_decode($request->getContent(), true);

            // Validar datos requeridos
            if (!isset($data['nombre']) || !isset($data['precio']) || !isset($data['stock']) || !isset($data['descripcion'])) {
                return $this->json(['error' => 'Faltan datos requeridos'], Response::HTTP_BAD_REQUEST);
            }

            // Validar stock
            if ($data['stock'] < 0) {
                return $this->json(['error' => 'El stock no puede ser negativo'], Response::HTTP_BAD_REQUEST);
            }

            // Validar imágenes
            if (!isset($data['imagenes']) || !is_array($data['imagenes']) || count($data['imagenes']) !== 4) {
                return $this->json([
                    'error' => 'Se requieren exactamente 4 imágenes',
                    'detalles' => 'El campo imagenes debe ser un array con 4 elementos'
                ], Response::HTTP_BAD_REQUEST);
            }

            $product = new Product();
            $product->setNombre($data['nombre']);
            $product->setPrecio($data['precio']);
            $product->setStock($data['stock']);
            $product->setDescripcion($data['descripcion']);
            $product->setVisible(true);

            // Procesar las imágenes
            $imageNames = [];
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/images/products/';

            // Asegurarse de que el directorio existe
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            foreach ($data['imagenes'] as $index => $base64Image) {
                // Validar que sea una imagen base64 válida
                if (!preg_match('/^data:image\/(jpeg|png|webp);base64,/', $base64Image)) {
                    return $this->json([
                        'error' => 'Formato de imagen inválido',
                        'detalles' => 'Las imágenes deben estar en formato base64 (JPEG, PNG o WEBP)'
                    ], Response::HTTP_BAD_REQUEST);
                }

                // Extraer la parte base64 de la imagen
                $imageData = explode(',', $base64Image)[1];
                $imageData = base64_decode($imageData);

                // Generar nombre único para la imagen
                $extension = 'webp'; // o jpg, png según el formato original
                $fileName = uniqid() . '_' . $index . '.' . $extension;
                
                // Guardar la imagen
                file_put_contents($uploadDir . $fileName, $imageData);
                
                $imageNames[] = $fileName;
            }

            // Guardar los nombres de las imágenes en el producto
            $product->setImagenes($imageNames);
            // Establecer la primera imagen como imagen principal
            $product->setImagen($imageNames[0]);

            $entityManager->persist($product);
            $entityManager->flush();

            return $this->json([
                'message' => 'Producto creado correctamente',
                'producto' => [
                    'id' => $product->getId(),
                    'nombre' => $product->getNombre(),
                    'precio' => $product->getPrecio(),
                    'stock' => $product->getStock(),
                    'descripcion' => $product->getDescripcion(),
                    'imagen' => $product->getImagen(),
                    'imagenes' => $product->getImagenes(),
                    'visible' => $product->isVisible(),
                ]
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al crear el producto',
                'detalles' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route("/product/{id}", name: "product_show", methods: ["GET"], requirements: ["id" => "\d+"])]
    public function show(int $id, EntityManagerInterface $entityManager): Response
    {
        $product = $entityManager->getRepository(Product::class)->find($id);

        if (!$product) {
            return $this->json(['error' => 'Producto no encontrado'], Response::HTTP_NOT_FOUND);
        }

        $data = [
            'id' => $product->getId(),
            'nombre' => $product->getNombre(),
            'precio' => $product->getPrecio(),
            'stock' => $product->getStock(),
            'descripcion' => $product->getDescripcion(),
            'imagen' => $product->getImagen(),
            'imagenes' => $product->getImagenes(),
            'visible' => $product->isVisible()
        ];

        return $this->json($data);
    }

    #[Route("/product/all", name: "product_all", methods: ["GET"])]
    public function all(ProductRepository $productRepository): Response
    {
        try {
            $products = $productRepository->findAll();
            $data = array_map(function($product) {
                try {
                    $imagenes = $product->getImagenes();
                    if (!is_array($imagenes)) {
                        $imagenes = [];
                    }
                    
                    return [
                        'id' => $product->getId(),
                        'nombre' => $product->getNombre(),
                        'precio' => $product->getPrecio(),
                        'stock' => $product->getStock(),
                        'descripcion' => $product->getDescripcion(),
                        'imagen' => $product->getImagen(),
                        'imagenes' => $imagenes,
                        'visible' => $product->isVisible(),
                    ];
                } catch (\Exception $e) {
                    return [
                        'error' => 'Error al procesar el producto: ' . $e->getMessage(),
                        'product_id' => $product->getId()
                    ];
                }
            }, $products);
            
            return $this->json($data);
        } catch (\Throwable $e) {
            return $this->json([
                'error' => 'Error al obtener los productos',
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route("/product/{id}", name: "product_edit", methods: ["PUT", "PATCH"], requirements: ["id" => "\\d+"])]
    public function edit(int $id, Request $request, EntityManagerInterface $entityManager): Response
    {
        try {
            $product = $entityManager->getRepository(Product::class)->find($id);

            if (!$product) {
                return $this->json(['error' => 'Producto no encontrado'], Response::HTTP_NOT_FOUND);
            }

            $data = json_decode($request->getContent(), true);

            // Actualizar campos si están presentes en la solicitud
            if (isset($data['nombre'])) {
                $product->setNombre($data['nombre']);
            }
            if (isset($data['precio'])) {
                $product->setPrecio((float)$data['precio']);
            }
            if (isset($data['stock'])) {
                $stock = (int)$data['stock'];
                if ($stock < 0) {
                    return $this->json(['error' => 'El stock no puede ser negativo'], Response::HTTP_BAD_REQUEST);
                }
                $product->setStock($stock);
            }
            if (isset($data['descripcion'])) {
                $product->setDescripcion($data['descripcion']);
            }
            if (isset($data['visible'])) {
                $product->setVisible($data['visible']);
            }

            // Procesar imágenes solo si se proporcionan
            if (isset($data['imagenes']) && is_array($data['imagenes']) && !empty($data['imagenes'])) {
                if (count($data['imagenes']) !== 4) {
                    return $this->json([
                        'error' => 'Se requieren exactamente 4 imágenes',
                        'detalles' => 'El campo imagenes debe ser un array con 4 elementos'
                    ], Response::HTTP_BAD_REQUEST);
                }

                $imageNames = [];
                $uploadDir = $this->getParameter('kernel.project_dir') . '/public/images/products/';

                // Asegurarse de que el directorio existe
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                // Eliminar imágenes antiguas
                $oldImages = $product->getImagenes();
                foreach ($oldImages as $oldImage) {
                    $oldImagePath = $uploadDir . $oldImage;
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }

                foreach ($data['imagenes'] as $index => $base64Image) {
                    // Validar que sea una imagen base64 válida
                    if (!preg_match('/^data:image\/(jpeg|png|webp);base64,/', $base64Image)) {
                        return $this->json([
                            'error' => 'Formato de imagen inválido',
                            'detalles' => 'Las imágenes deben estar en formato base64 (JPEG, PNG o WEBP)'
                        ], Response::HTTP_BAD_REQUEST);
                    }

                    // Extraer la parte base64 de la imagen
                    $imageData = explode(',', $base64Image)[1];
                    $imageData = base64_decode($imageData);

                    // Generar nombre único para la imagen
                    $extension = 'webp'; // o jpg, png según el formato original
                    $fileName = uniqid() . '_' . $index . '.' . $extension;
                    
                    // Guardar la imagen
                    file_put_contents($uploadDir . $fileName, $imageData);
                    
                    $imageNames[] = $fileName;
                }

                // Actualizar las imágenes del producto
                $product->setImagenes($imageNames);
                $product->setImagen($imageNames[0]);
            }

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
                    'imagenes' => $product->getImagenes(),
                    'visible' => $product->isVisible(),
                ]
            ]);

        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al actualizar el producto',
                'detalles' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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

    #[Route("/product/{id}/stock", name: "product_update_stock", methods: ["PATCH"], requirements: ["id" => "\d+"])]
    public function updateStock(int $id, Request $request, EntityManagerInterface $entityManager): Response
    {
        $product = $entityManager->getRepository(Product::class)->find($id);

        if (!$product) {
            return $this->json(['error' => 'Producto no encontrado'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true);

        if (!isset($data['cantidad'])) {
            return $this->json(['error' => 'Se requiere la cantidad a actualizar'], Response::HTTP_BAD_REQUEST);
        }

        $nuevaCantidad = $product->getStock() + $data['cantidad'];
        
        if ($nuevaCantidad < 0) {
            return $this->json([
                'error' => 'No hay suficiente stock para realizar esta operación',
                'stock_actual' => $product->getStock()
            ], Response::HTTP_BAD_REQUEST);
        }

        $product->setStock($nuevaCantidad);
        $entityManager->flush();

        return $this->json([
            'message' => 'Stock actualizado correctamente',
            'stock_actual' => $product->getStock()
        ]);
    }

    #[Route("/product/{id}/check-stock", name: "product_check_stock", methods: ["GET"], requirements: ["id" => "\d+"])]
    public function checkStock(int $id, Request $request, EntityManagerInterface $entityManager): Response
    {
        $product = $entityManager->getRepository(Product::class)->find($id);

        if (!$product) {
            return $this->json(['error' => 'Producto no encontrado'], Response::HTTP_NOT_FOUND);
        }

        $cantidad = $request->query->get('cantidad', 1);
        
        if ($cantidad <= 0) {
            return $this->json(['error' => 'La cantidad debe ser mayor a 0'], Response::HTTP_BAD_REQUEST);
        }

        $disponible = $product->getStock() >= $cantidad;

        return $this->json([
            'disponible' => $disponible,
            'stock_actual' => $product->getStock(),
            'cantidad_solicitada' => $cantidad
        ]);
    }
}