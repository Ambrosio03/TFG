<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use App\Entity\User;

#[ORM\Entity]
#[ORM\Table(name: 'pedidos')]
class Pedido
{
    public const ESTADO_PENDIENTE = 'pendiente';
    public const ESTADO_EN_PROCESO = 'en_proceso';
    public const ESTADO_ENVIADO = 'enviado';
    public const ESTADO_ENTREGADO = 'entregado';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $usuario = null;

    #[ORM\Column(type: 'string', length: 20)]
    private string $estado = self::ESTADO_PENDIENTE;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $fechaCreacion = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $fechaEnvio = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    private ?\DateTimeInterface $fechaEntrega = null;

    #[ORM\Column(type: 'decimal', precision: 10, scale: 2)]
    private ?float $total = null;

    #[ORM\OneToMany(mappedBy: 'pedido', targetEntity: PedidoItem::class, cascade: ['persist', 'remove'])]
    private Collection $items;

    public function __construct()
    {
        $this->items = new ArrayCollection();
        $this->fechaCreacion = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsuario(): ?User
    {
        return $this->usuario;
    }

    public function setUsuario(?User $usuario): self
    {
        $this->usuario = $usuario;
        return $this;
    }

    public function getEstado(): string
    {
        return $this->estado;
    }

    public function setEstado(string $estado): self
    {
        if (!in_array($estado, [
            self::ESTADO_PENDIENTE,
            self::ESTADO_EN_PROCESO,
            self::ESTADO_ENVIADO,
            self::ESTADO_ENTREGADO
        ])) {
            throw new \InvalidArgumentException('Estado no válido');
        }
        $this->estado = $estado;
        return $this;
    }

    public function getFechaCreacion(): ?\DateTimeInterface
    {
        return $this->fechaCreacion;
    }

    public function setFechaCreacion(\DateTimeInterface $fechaCreacion): self
    {
        $this->fechaCreacion = $fechaCreacion;
        return $this;
    }

    public function getFechaEnvio(): ?\DateTimeInterface
    {
        return $this->fechaEnvio;
    }

    public function setFechaEnvio(?\DateTimeInterface $fechaEnvio): self
    {
        $this->fechaEnvio = $fechaEnvio;
        return $this;
    }

    public function getFechaEntrega(): ?\DateTimeInterface
    {
        return $this->fechaEntrega;
    }

    public function setFechaEntrega(?\DateTimeInterface $fechaEntrega): self
    {
        $this->fechaEntrega = $fechaEntrega;
        return $this;
    }

    public function getTotal(): ?float
    {
        return $this->total;
    }

    public function setTotal(float $total): self
    {
        $this->total = $total;
        return $this;
    }

    public function getItems(): Collection
    {
        return $this->items;
    }

    public function addItem(PedidoItem $item): self
    {
        if (!$this->items->contains($item)) {
            $this->items[] = $item;
            $item->setPedido($this);
        }
        return $this;
    }

    public function removeItem(PedidoItem $item): self
    {
        if ($this->items->removeElement($item)) {
            if ($item->getPedido() === $this) {
                $item->setPedido(null);
            }
        }
        return $this;
    }

    public function calcularTotal(): float
    {
        $total = 0;
        foreach ($this->items as $item) {
            $total += $item->getPrecioUnitario() * $item->getCantidad();
        }
        return $total;
    }
} 