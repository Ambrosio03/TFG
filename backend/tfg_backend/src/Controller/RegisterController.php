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
 * Controlador para gestionar el registro de nuevos usuarios
 */
class RegisterController extends AbstractController
{
    /**
     * Registra un nuevo usuario en el sistema
     * @param Request $request Datos del usuario a registrar
     * @return Response Mensaje de éxito o error
     */
    #[Route('/register', name: 'user_register', methods: ['POST'])]
    public function register(Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher): Response
    {
        $data = json_decode($request->getContent(), true);
        if ($data === null) {
            return $this->json(['error' => 'Invalid JSON'], Response::HTTP_BAD_REQUEST);
        }

        // Verificar que las claves esperadas estén presentes
        if (!isset($data['nombre_usuario'], $data['email'], $data['password'])) {
            return $this->json(['error' => 'Missing required fields'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $user = new User();
            $user->setNombreUsuario($data['nombre_usuario']);
            $user->setEmail($data['email']);
            $user->setPassword($passwordHasher->hashPassword($user, $data['password']));

            $entityManager->persist($user);
            $entityManager->flush();

            return $this->json(['message' => 'User registered successfully']);
        } catch (\Exception $e) {
            return $this->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
