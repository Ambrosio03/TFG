<?php

namespace App\Repository;

use App\Entity\Product;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Product>
 */
class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    /**
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
