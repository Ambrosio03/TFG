<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250512053238 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE cart ADD CONSTRAINT FK_BA388B7A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)
        SQL);
        $this->addSql(<<<'SQL'
            CREATE INDEX IDX_BA388B7A76ED395 ON cart (user_id)
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users ADD role VARCHAR(20) NOT NULL
        SQL);
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql(<<<'SQL'
            ALTER TABLE cart DROP FOREIGN KEY FK_BA388B7A76ED395
        SQL);
        $this->addSql(<<<'SQL'
            DROP INDEX IDX_BA388B7A76ED395 ON cart
        SQL);
        $this->addSql(<<<'SQL'
            ALTER TABLE users DROP role
        SQL);
    }
}
