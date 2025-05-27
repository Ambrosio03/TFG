<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250521080802 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE pedido_items DROP FOREIGN KEY FK_A56BD82B7645698E
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE pedido_items ADD CONSTRAINT FK_A56BD82B7645698E FOREIGN KEY (producto_id) REFERENCES products (id) ON DELETE CASCADE
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE products CHANGE imagenes imagenes JSON DEFAULT NULL COMMENT '(DC2Type:json)'
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE pedido_items DROP FOREIGN KEY FK_A56BD82B7645698E
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE pedido_items ADD CONSTRAINT FK_A56BD82B7645698E FOREIGN KEY (producto_id) REFERENCES products (id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE products CHANGE imagenes imagenes JSON DEFAULT NULL COMMENT '(DC2Type:json)'
        SQL);
    }
}
