<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class UserController extends AbstractController
{
    #[Route("/user", name: "user_index", methods: ["GET"])]
    public function index(EntityManagerInterface $entityManager): Response
    {
        $users = $entityManager->getRepository(User::class)->findAll();
        $data = array_map(function($user) {
            return [
                'id' => $user->getId(),
                'nombre_usuario' => $user->getNombreUsuario(),
                'email' => $user->getEmail(),
                'role' => $user->getRole(),
                'isBlocked' => $user->isBlocked(),
            ];
        }, $users);
        return $this->json($data);
    }

    #[Route("/user", name: "user_create", methods: ["POST"])]
    public function create(Request $request, EntityManagerInterface $entityManager): Response
    {
        $data = json_decode($request->getContent(), true);

        $user = new User();
        $user->setNombreUsuario($data['nombre_usuario']);
        $user->setEmail($data['email']);
        $user->setPassword($data['password']);

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json($user);
    }

    #[Route('/users/{id}/role', name: 'user_change_role', methods: ['PUT', 'PATCH'], requirements: ['id' => '\d+'])]
    public function changeRole(int $id, Request $request, EntityManagerInterface $entityManager): Response
    {
        $user = $entityManager->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'Usuario no encontrado'], Response::HTTP_NOT_FOUND);
        }
        $data = json_decode($request->getContent(), true);
        if (!isset($data['role'])) {
            return $this->json(['error' => 'No se proporcionó el campo role'], 400);
        }
        try {
            $user->setRole($data['role']);
        } catch (\InvalidArgumentException $e) {
            return $this->json(['error' => $e->getMessage()], 400);
        }
        $entityManager->flush();
        return $this->json([
            'message' => 'Rol actualizado correctamente',
            'id' => $user->getId(),
            'role' => $user->getRole()
        ]);
    }

    #[Route('/users/{id}/block', name: 'user_block', methods: ['PUT', 'PATCH'], requirements: ['id' => '\d+'])]
    public function blockUser(int $id, Request $request, EntityManagerInterface $entityManager): Response
    {
        $user = $entityManager->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'Usuario no encontrado'], Response::HTTP_NOT_FOUND);
        }
        $data = json_decode($request->getContent(), true);
        if (!isset($data['isBlocked'])) {
            return $this->json(['error' => 'No se proporcionó el campo isBlocked'], 400);
        }
        $user->setIsBlocked((bool)$data['isBlocked']);
        $entityManager->flush();
        return $this->json([
            'message' => $user->isBlocked() ? 'Usuario bloqueado' : 'Usuario desbloqueado',
            'id' => $user->getId(),
            'isBlocked' => $user->isBlocked()
        ]);
    }

    #[Route('/users', name: 'users_list', methods: ['GET'])]
    public function list(Request $request, EntityManagerInterface $entityManager): Response
    {
        $search = $request->query->get('search');
        $userRepo = $entityManager->getRepository(User::class);
        if ($search) {
            $users = $userRepo->createQueryBuilder('u')
                ->where('u.nombre_usuario LIKE :search')
                ->setParameter('search', '%' . $search . '%')
                ->getQuery()
                ->getResult();
        } else {
            $users = $userRepo->findAll();
        }
        $data = array_map(function($user) {
            return [
                'id' => $user->getId(),
                'nombre_usuario' => $user->getNombreUsuario(),
                'email' => $user->getEmail(),
                'role' => $user->getRole(),
                'isBlocked' => $user->isBlocked(),
            ];
        }, $users);
        return $this->json($data);
    }

    #[Route('/user/me', name: 'api_user_me', methods: ['GET'])]
    public function apiMe(): Response
    {
        $user = $this->getUser();
        if (!$user || !($user instanceof \App\Entity\User)) {
            return $this->json(['error' => 'No autenticado'], Response::HTTP_UNAUTHORIZED);
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