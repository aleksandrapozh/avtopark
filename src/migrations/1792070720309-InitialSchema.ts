import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1792070720309 implements MigrationInterface {
    name = 'InitialSchema1792070720309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`refuelings\` (\`refueling_id\` int NOT NULL AUTO_INCREMENT, \`vehicle_id\` int NOT NULL, \`driver_id\` int NOT NULL, \`refueling_date\` datetime NOT NULL, \`fuel_amount\` decimal(10,2) NOT NULL, \`price_per_liter\` decimal(10,2) NOT NULL, \`total_cost\` decimal(10,2) NOT NULL, \`fuel_type\` varchar(20) NOT NULL, PRIMARY KEY (\`refueling_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`fines\` (\`fine_id\` int NOT NULL AUTO_INCREMENT, \`vehicle_id\` int NOT NULL, \`violation_date\` datetime NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`article_number\` varchar(50) NOT NULL, \`status\` varchar(50) NOT NULL DEFAULT 'unpaid', PRIMARY KEY (\`fine_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`suppliers\` (\`supplier_id\` int NOT NULL AUTO_INCREMENT, \`supplier_name\` varchar(150) NOT NULL, \`inn\` varchar(12) NOT NULL, \`phone\` varchar(20) NOT NULL, \`email\` varchar(100) NULL, \`address\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_5f4e6b7f429b36699a1d40243b\` (\`inn\`), PRIMARY KEY (\`supplier_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`parts\` (\`part_id\` int NOT NULL AUTO_INCREMENT, \`supplier_id\` int NOT NULL, \`part_number\` varchar(50) NOT NULL, \`part_name\` varchar(150) NOT NULL, \`quantity\` int NOT NULL DEFAULT '0', \`price\` decimal(10,2) NOT NULL, PRIMARY KEY (\`part_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`maintenance\` (\`maintenance_id\` int NOT NULL AUTO_INCREMENT, \`vehicle_id\` int NOT NULL, \`part_id\` int NOT NULL, \`maintenance_date\` date NOT NULL, \`work_type\` varchar(100) NOT NULL, \`parts_quantity\` int NOT NULL DEFAULT '1', \`total_cost\` decimal(10,2) NOT NULL, \`mechanic_notes\` text NULL, PRIMARY KEY (\`maintenance_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vehicles\` (\`vehicle_id\` int NOT NULL AUTO_INCREMENT, \`license_plate\` varchar(20) NOT NULL, \`brand_model\` varchar(100) NOT NULL, \`vin\` varchar(17) NOT NULL, \`year\` int NOT NULL, \`mileage\` int NOT NULL DEFAULT '0', \`status\` varchar(50) NOT NULL DEFAULT 'available', UNIQUE INDEX \`IDX_7e9fab2e8625b63613f67bd706\` (\`license_plate\`), UNIQUE INDEX \`IDX_8288ce015b69c5856cf54e07a6\` (\`vin\`), PRIMARY KEY (\`vehicle_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`user_id\` int NOT NULL AUTO_INCREMENT, \`login\` varchar(50) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`last_name\` varchar(50) NOT NULL, \`first_name\` varchar(50) NOT NULL, \`middle_name\` varchar(50) NULL, \`role\` varchar(50) NOT NULL DEFAULT 'dispatcher', \`email\` varchar(100) NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT '1', UNIQUE INDEX \`IDX_2d443082eccd5198f95f2a36e2\` (\`login\`), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`waybills\` (\`waybill_id\` int NOT NULL AUTO_INCREMENT, \`vehicle_id\` int NOT NULL, \`driver_id\` int NOT NULL, \`user_id\` int NOT NULL, \`waybill_number\` varchar(50) NOT NULL, \`issue_date\` date NOT NULL, \`start_mileage\` int NOT NULL, \`end_mileage\` int NULL, \`fuel_issued\` decimal(10,2) NOT NULL DEFAULT '0.00', \`status\` varchar(50) NOT NULL DEFAULT 'open', UNIQUE INDEX \`IDX_398f5fbb9dbc3e539fbfc8fc37\` (\`waybill_number\`), PRIMARY KEY (\`waybill_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`drivers\` (\`driver_id\` int NOT NULL AUTO_INCREMENT, \`last_name\` varchar(50) NOT NULL, \`first_name\` varchar(50) NOT NULL, \`middle_name\` varchar(50) NULL, \`license_number\` varchar(50) NOT NULL, \`phone\` varchar(20) NOT NULL, \`status\` varchar(50) NOT NULL DEFAULT 'active', UNIQUE INDEX \`IDX_47543bd8e5e11a094ded9a56e9\` (\`license_number\`), PRIMARY KEY (\`driver_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`refuelings\` ADD CONSTRAINT \`FK_5d4b0f9db0f3c264151fa72a6b9\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\`(\`vehicle_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`refuelings\` ADD CONSTRAINT \`FK_ccbf825791d644da08b1a1c6d2f\` FOREIGN KEY (\`driver_id\`) REFERENCES \`drivers\`(\`driver_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`fines\` ADD CONSTRAINT \`FK_f1c0e5fc6a309af341e0177d90b\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\`(\`vehicle_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`parts\` ADD CONSTRAINT \`FK_bb412d8e185245ebe7582945e8e\` FOREIGN KEY (\`supplier_id\`) REFERENCES \`suppliers\`(\`supplier_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`maintenance\` ADD CONSTRAINT \`FK_695487b4a7876df7e70f2ae8564\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\`(\`vehicle_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`maintenance\` ADD CONSTRAINT \`FK_b53affd889ffda706db7ab0041c\` FOREIGN KEY (\`part_id\`) REFERENCES \`parts\`(\`part_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`waybills\` ADD CONSTRAINT \`FK_169c4d98db3a661f5b5c9db99a1\` FOREIGN KEY (\`vehicle_id\`) REFERENCES \`vehicles\`(\`vehicle_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`waybills\` ADD CONSTRAINT \`FK_4bc7858657cbac3d62ac5225ebc\` FOREIGN KEY (\`driver_id\`) REFERENCES \`drivers\`(\`driver_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`waybills\` ADD CONSTRAINT \`FK_5423ca151a432b1e6d395e1a1ab\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`user_id\`) ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`waybills\` DROP FOREIGN KEY \`FK_5423ca151a432b1e6d395e1a1ab\``);
        await queryRunner.query(`ALTER TABLE \`waybills\` DROP FOREIGN KEY \`FK_4bc7858657cbac3d62ac5225ebc\``);
        await queryRunner.query(`ALTER TABLE \`waybills\` DROP FOREIGN KEY \`FK_169c4d98db3a661f5b5c9db99a1\``);
        await queryRunner.query(`ALTER TABLE \`maintenance\` DROP FOREIGN KEY \`FK_b53affd889ffda706db7ab0041c\``);
        await queryRunner.query(`ALTER TABLE \`maintenance\` DROP FOREIGN KEY \`FK_695487b4a7876df7e70f2ae8564\``);
        await queryRunner.query(`ALTER TABLE \`parts\` DROP FOREIGN KEY \`FK_bb412d8e185245ebe7582945e8e\``);
        await queryRunner.query(`ALTER TABLE \`fines\` DROP FOREIGN KEY \`FK_f1c0e5fc6a309af341e0177d90b\``);
        await queryRunner.query(`ALTER TABLE \`refuelings\` DROP FOREIGN KEY \`FK_ccbf825791d644da08b1a1c6d2f\``);
        await queryRunner.query(`ALTER TABLE \`refuelings\` DROP FOREIGN KEY \`FK_5d4b0f9db0f3c264151fa72a6b9\``);
        await queryRunner.query(`DROP INDEX \`IDX_47543bd8e5e11a094ded9a56e9\` ON \`drivers\``);
        await queryRunner.query(`DROP TABLE \`drivers\``);
        await queryRunner.query(`DROP INDEX \`IDX_398f5fbb9dbc3e539fbfc8fc37\` ON \`waybills\``);
        await queryRunner.query(`DROP TABLE \`waybills\``);
        await queryRunner.query(`DROP INDEX \`IDX_2d443082eccd5198f95f2a36e2\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_8288ce015b69c5856cf54e07a6\` ON \`vehicles\``);
        await queryRunner.query(`DROP INDEX \`IDX_7e9fab2e8625b63613f67bd706\` ON \`vehicles\``);
        await queryRunner.query(`DROP TABLE \`vehicles\``);
        await queryRunner.query(`DROP TABLE \`maintenance\``);
        await queryRunner.query(`DROP TABLE \`parts\``);
        await queryRunner.query(`DROP INDEX \`IDX_5f4e6b7f429b36699a1d40243b\` ON \`suppliers\``);
        await queryRunner.query(`DROP TABLE \`suppliers\``);
        await queryRunner.query(`DROP TABLE \`fines\``);
        await queryRunner.query(`DROP TABLE \`refuelings\``);
    }

}
