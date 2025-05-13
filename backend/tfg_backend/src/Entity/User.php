<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity]
#[ORM\Table(name: 'users')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255, unique: true)]
    private ?string $nombre_usuario = null;

    #[ORM\Column(type: 'string', length: 255, unique: true)]
    private ?string $email = null;

    #[ORM\Column(type: 'string', length: 255)]
    private ?string $password = null;

    #[ORM\Column(type: 'string', length: 20)]
    private string $role = 'ROLE_CLIENTE';

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $isBlocked = false;

    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Cart::class, cascade: ['persist', 'remove'])]
    private $carts;

    public function __construct()
    {
        $this->carts = new ArrayCollection();
    }

    // Getters y setters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNombreUsuario(): ?string
    {
        return $this->nombre_usuario;
    }

    public function setNombreUsuario(string $nombre_usuario): self
    {
        $this->nombre_usuario = $nombre_usuario;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    public function getCarts(): Collection
    {
        return $this->carts;
    }

    public function addCart(Cart $cart): self
    {
        if (!$this->carts->contains($cart)) {
            $this->carts[] = $cart;
            $cart->setUser($this);
        }

        return $this;
    }

    public function removeCart(Cart $cart): self
    {
        if ($this->carts->removeElement($cart)) {
            // set the owning side to null (unless already changed)
            if ($cart->getUser() === $this) {
                $cart->setUser(null);
            }
        }

        return $this;
    }

    // Métodos requeridos por UserInterface
    public function getRoles(): array
    {
        // Aseguramos que siempre devuelva un array con al menos ROLE_USER
        $roles = [$this->role];
        // Aseguramos que ROLE_USER esté siempre presente
        if (!in_array('ROLE_USER', $roles)) {
            $roles[] = 'ROLE_USER';
        }
        return array_unique($roles);
    }

    public function setRole(string $role): self
    {
        if (!in_array($role, ['ROLE_CLIENTE', 'ROLE_ADMIN'])) {
            throw new \InvalidArgumentException('Rol no válido');
        }
        $this->role = $role;
        return $this;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function eraseCredentials(): void
    {
        // Si almacenas datos sensibles temporales
    }

    public function getUserIdentifier(): string
    {
        return (string) $this->email;
    }

    public function isBlocked(): bool
    {
        return $this->isBlocked;
    }

    public function setIsBlocked(bool $isBlocked): self
    {
        $this->isBlocked = $isBlocked;
        return $this;
    }
} 