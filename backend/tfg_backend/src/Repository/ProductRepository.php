<?php

namespace App\Repository;

use App\Entity\Product;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repositorio para la entidad Product
 * Contiene métodos personalizados para consultar productos en la base de datos
 */
class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    /**
     * Devuelve un array de productos que están marcados como visibles
     * @return Product[]
     */
    public function findVisibleProducts(): array
    {
        try {
            return $this->createQueryBuilder('p')
                ->where('p.visible = :visible')
                ->setParameter('visible', true)
                ->getQuery()
                ->getResult();
        } catch (\Exception $e) {
            throw new \Exception('Error al buscar productos visibles: ' . $e->getMessage());
        }
    }
}
