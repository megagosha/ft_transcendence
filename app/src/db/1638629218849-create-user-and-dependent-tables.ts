import {MigrationInterface, QueryRunner} from "typeorm";

export class createUserAndDependentTables1638629218849 implements MigrationInterface {
    name = 'createUserAndDependentTables1638629218849'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ft_game_statistic" ("id" SERIAL NOT NULL, "gameWon" integer NOT NULL DEFAULT '0', "gameLost" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_14dd44196160e387912edc79ef3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ft_user" ("id" SERIAL NOT NULL, "version" integer NOT NULL, "username" character varying(120) NOT NULL, "password" character varying(65) NOT NULL, "registerDate" TIMESTAMP NOT NULL DEFAULT now(), "lastLoginDate" TIMESTAMP NOT NULL, "status" character varying(15) NOT NULL, "avatarImgName" character varying(100), "game_statistic_id" integer NOT NULL, CONSTRAINT "UQ_7be922bfcff3f9908fa6e03bef6" UNIQUE ("username"), CONSTRAINT "REL_293c3745fb8ae6909a08878631" UNIQUE ("game_statistic_id"), CONSTRAINT "PK_e36eb77033cfa5d85442fc9395b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ft_friendship" ("id" SERIAL NOT NULL, "beginDate" TIMESTAMP, "friends" boolean NOT NULL DEFAULT false, "invitor_user_id" integer, "invited_user_id" integer, CONSTRAINT "PK_d8d0e0f9dbac0029ae5daf802f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "friendship_invited_index" ON "ft_friendship" ("invited_user_id") `);
        await queryRunner.query(`CREATE INDEX "friendship_invitor_index" ON "ft_friendship" ("invitor_user_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "friendship_invitor_invited_index" ON "ft_friendship" ("invitor_user_id", "invited_user_id") `);
        await queryRunner.query(`ALTER TABLE "ft_user" ADD CONSTRAINT "FK_293c3745fb8ae6909a088786317" FOREIGN KEY ("game_statistic_id") REFERENCES "ft_game_statistic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ft_friendship" ADD CONSTRAINT "FK_f30b4b461e64a5e5fe54f83154d" FOREIGN KEY ("invitor_user_id") REFERENCES "ft_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ft_friendship" ADD CONSTRAINT "FK_c9e0a86f533298e634628fe2af7" FOREIGN KEY ("invited_user_id") REFERENCES "ft_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ft_friendship" DROP CONSTRAINT "FK_c9e0a86f533298e634628fe2af7"`);
        await queryRunner.query(`ALTER TABLE "ft_friendship" DROP CONSTRAINT "FK_f30b4b461e64a5e5fe54f83154d"`);
        await queryRunner.query(`ALTER TABLE "ft_user" DROP CONSTRAINT "FK_293c3745fb8ae6909a088786317"`);
        await queryRunner.query(`DROP INDEX "public"."friendship_invitor_invited_index"`);
        await queryRunner.query(`DROP INDEX "public"."friendship_invitor_index"`);
        await queryRunner.query(`DROP INDEX "public"."friendship_invited_index"`);
        await queryRunner.query(`DROP TABLE "ft_friendship"`);
        await queryRunner.query(`DROP TABLE "ft_user"`);
        await queryRunner.query(`DROP TABLE "ft_game_statistic"`);
    }

}
