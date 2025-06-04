<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Entidad que representa un producto en la tienda
 * Incluye información como nombre, precio, stock, descripción, imágenes y visibilidad
 */
#[ORM\Entity]
#[ORM\Table(name: 'products')]
class Product
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $nombre = null;

    #[ORM\Column(type: 'decimal', scale: 2)]
    private ?float $precio = null;

    #[ORM\Column(type: 'integer')]
    private ?int $stock = null;

    #[ORM\Column(type: 'text')]
    private ?string $descripcion = null;

    #[ORM\Column(type: 'string', length: 255, nullable: true)]
    private ?string $imagen = null;

    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $imagenes = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $visible = true;

    /**
     * Obtiene el identificador único del producto
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Obtiene el nombre del producto
     */
    public function getNombre(): ?string
    {
        return $this->nombre;
    }

    /**
     * Establece el nombre del producto
     */
    public function setNombre(string $nombre): self
    {
        $this->nombre = $nombre;

        return $this;
    }

    /**
     * Obtiene el precio del producto
     */
    public function getPrecio(): ?float
    {
        return $this->precio;
    }

    /**
     * Establece el precio del producto
     */
    public function setPrecio(float $precio): self
    {
        $this->precio = $precio;

        return $this;
    }

    /**
     * Obtiene el stock disponible del producto
     */
    public function getStock(): ?int
    {
        return $this->stock;
    }

    /**
     * Establece el stock disponible del producto
     */
    public function setStock(int $stock): self
    {
        $this->stock = $stock;

        return $this;
    }

    /**
     * Obtiene la descripción del producto
     */
    public function getDescripcion(): ?string
    {
        return $this->descripcion;
    }

    /**
     * Establece la descripción del producto
     */
    public function setDescripcion(string $descripcion): self
    {
        $this->descripcion = $descripcion;

        return $this;
    }

    /**
     * Obtiene la imagen principal del producto
     */
    public function getImagen(): ?string
    {
        return $this->imagen;
    }

    /**
     * Establece la imagen principal del producto
     */
    public function setImagen(?string $imagen): self
    {
        $this->imagen = $imagen;

        return $this;
    }

    /**
     * Obtiene el array de imágenes del producto
     */
    public function getImagenes(): array
    {
        return $this->imagenes ?? [];
    }

    /**
     * Establece el array de imágenes del producto
     */
    public function setImagenes(?array $imagenes): self
    {
        $this->imagenes = $imagenes;
        return $this;
    }

    /**
     * Indica si el producto es visible en la tienda
     */
    public function isVisible(): bool
    {
        return $this->visible;
    }

    /**
     * Establece la visibilidad del producto
     */
    public function setVisible(bool $visible): self
    {
        $this->visible = $visible;
        return $this;
    }
}
