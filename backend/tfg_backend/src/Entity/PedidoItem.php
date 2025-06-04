<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Entidad que representa un producto incluido en un pedido
 * Incluye la referencia al pedido, producto, cantidad y precio unitario
 */
#[ORM\Entity]
#[ORM\Table(name: 'pedido_items')]
class PedidoItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Pedido::class, inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Pedido $pedido = null;

    #[ORM\ManyToOne(targetEntity: Product::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: "CASCADE")]
    private ?Product $producto = null;

    #[ORM\Column(type: 'integer')]
    private ?int $cantidad = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private ?float $precioUnitario = null;

    /**
     * Obtiene el identificador único del item del pedido
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Obtiene el pedido al que pertenece el item
     */
    public function getPedido(): ?Pedido
    {
        return $this->pedido;
    }

    /**
     * Establece el pedido al que pertenece el item
     */
    public function setPedido(?Pedido $pedido): self
    {
        $this->pedido = $pedido;
        return $this;
    }

    /**
     * Obtiene el producto asociado al item
     */
    public function getProducto(): ?Product
    {
        return $this->producto;
    }

    /**
     * Establece el producto asociado al item
     */
    public function setProducto(?Product $producto): self
    {
        $this->producto = $producto;
        return $this;
    }

    /**
     * Obtiene la cantidad de productos en el item
     */
    public function getCantidad(): ?int
    {
        return $this->cantidad;
    }

    /**
     * Establece la cantidad de productos en el item
     */
    public function setCantidad(int $cantidad): self
    {
        $this->cantidad = $cantidad;
        return $this;
    }

    /**
     * Obtiene el precio unitario del producto en el item
     */
    public function getPrecioUnitario(): ?float
    {
        return $this->precioUnitario;
    }

    /**
     * Establece el precio unitario del producto en el item
     */
    public function setPrecioUnitario(float $precioUnitario): self
    {
        $this->precioUnitario = $precioUnitario;
        return $this;
    }
} 