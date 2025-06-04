<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Entidad que representa un producto añadido a un carrito
 * Incluye la referencia al producto, al carrito y la cantidad seleccionada
 */
#[ORM\Entity]
class CartItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private $id;

    #[ORM\ManyToOne(targetEntity: Product::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: "CASCADE")]
    private ?Product $product = null;

    #[ORM\ManyToOne(targetEntity: Cart::class, inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: false)]
    private $cart;

    #[ORM\Column(type: 'integer')]
    private $quantity;

    /**
     * Obtiene el identificador único del item del carrito
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Obtiene el producto asociado al item
     */
    public function getProduct(): ?Product
    {
        return $this->product;
    }

    /**
     * Establece el producto asociado al item
     */
    public function setProduct(?Product $product): self
    {
        $this->product = $product;

        return $this;
    }

    /**
     * Obtiene el carrito al que pertenece el item
     */
    public function getCart(): ?Cart
    {
        return $this->cart;
    }

    /**
     * Establece el carrito al que pertenece el item
     */
    public function setCart(?Cart $cart): self
    {
        $this->cart = $cart;

        return $this;
    }

    /**
     * Obtiene la cantidad de productos en el item
     */
    public function getQuantity(): ?int
    {
        return $this->quantity;
    }

    /**
     * Establece la cantidad de productos en el item
     */
    public function setQuantity(int $quantity): self
    {
        $this->quantity = $quantity;

        return $this;
    }
} 