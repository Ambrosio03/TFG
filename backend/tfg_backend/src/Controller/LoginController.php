<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

/**
 * Controlador para gestionar el inicio de sesión de usuarios
 */
class LoginController extends AbstractController
{
    /**
     * Realiza el inicio de sesión de un usuario comprobando email y contraseña
     * @param Request $request Credenciales del usuario
     * @return Response Datos del usuario autenticado o error
     */
    #[Route('/login', name: 'user_login', methods: ['POST'])]
    public function login(Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher): Response
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['email'], $data['password'])) {
            return $this->json(['error' => 'Email y contraseña son requeridos'], Response::HTTP_BAD_REQUEST);
        }

        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if (!$user) {
            return $this->json(['error' => 'Usuario no encontrado'], Response::HTTP_NOT_FOUND);
        }

        if (!$passwordHasher->isPasswordValid($user, $data['password'])) {
            return $this->json(['error' => 'Credenciales inválidas'], Response::HTTP_UNAUTHORIZED);
        }

        return $this->json([
            'id' => $user->getId(),
            'nombre_usuario' => $user->getNombreUsuario(),
            'email' => $user->getEmail(),
            'role' => $user->getRole(),
            'isBlocked' => $user->isBlocked(),
        ]);
    }
}
