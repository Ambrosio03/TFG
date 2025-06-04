<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Entity\User;

/**
 * Entidad que representa un carrito de compras de un usuario
 * Incluye los productos añadidos, el usuario propietario y el estado del carrito
 */
#[ORM\Entity]
class Cart
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private $id;

    #[ORM\OneToMany(mappedBy: 'cart', targetEntity: CartItem::class, cascade: ['persist', 'remove'])]
    private $items;

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'carts')]
    #[ORM\JoinColumn(nullable: false)]
    private $user;

    #[ORM\Column(type: 'string', length: 50)]
    private $estado;

    public function __construct()
    {
        $this->items = new ArrayCollection();
    }

    /**
     * Obtiene el identificador único del carrito
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Obtiene la colección de items del carrito
     */
    public function getItems(): Collection
    {
        return $this->items;
    }

    /**
     * Añade un item al carrito
     */
    public function addItem(CartItem $item): self
    {
        if (!$this->items->contains($item)) {
            $this->items[] = $item;
            $item->setCart($this);
        }

        return $this;
    }

    /**
     * Elimina un item del carrito
     */
    public function removeItem(CartItem $item): self
    {
        if ($this->items->removeElement($item)) {
            // set the owning side to null (unless already changed)
            if ($item->getCart() === $this) {
                $item->setCart(null);
            }
        }

        return $this;
    }

    /**
     * Obtiene el usuario propietario del carrito
     */
    public function getUser(): ?User
    {
        return $this->user;
    }

    /**
     * Establece el usuario propietario del carrito
     */
    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Obtiene el estado actual del carrito
     */
    public function getEstado(): ?string
    {
        return $this->estado;
    }

    /**
     * Establece el estado del carrito
     */
    public function setEstado(string $estado): self
    {
        $this->estado = $estado;

        return $this;
    }
}
