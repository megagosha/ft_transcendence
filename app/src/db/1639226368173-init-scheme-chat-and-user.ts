import {MigrationInterface, QueryRunner} from "typeorm";

export class initSchemeChatAndUser1639226368173 implements MigrationInterface {
    name = 'initSchemeChatAndUser1639226368173'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ft_game_statistic" ("id" SERIAL NOT NULL, "gameWon" integer NOT NULL DEFAULT '0', "gameLost" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_14dd44196160e387912edc79ef3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ft_friendship" ("id" SERIAL NOT NULL, "beginDate" TIMESTAMP, "friends" boolean NOT NULL DEFAULT false, "invitor_user_id" integer, "invited_user_id" integer, CONSTRAINT "PK_d8d0e0f9dbac0029ae5daf802f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "friendship_invitor_invited_index" ON "ft_friendship" ("invitor_user_id", "invited_user_id") `);
        await queryRunner.query(`CREATE TABLE "ft_user" ("id" SERIAL NOT NULL, "version" integer NOT NULL, "username" character varying(120) NOT NULL, "fortytwo_id" integer NOT NULL, "email" character varying NOT NULL, "registerDate" TIMESTAMP(3) NOT NULL DEFAULT now(), "lastLoginDate" TIMESTAMP(3) NOT NULL DEFAULT ('now'::text)::timestamp(3) with time zone, "status" character varying(15) NOT NULL, "avatar_file_id" integer, "game_statistic_id" integer NOT NULL, CONSTRAINT "UQ_7be922bfcff3f9908fa6e03bef6" UNIQUE ("username"), CONSTRAINT "UQ_ff49ac1bf13a2a649886d4d120d" UNIQUE ("fortytwo_id"), CONSTRAINT "UQ_9d8d2132bd64bec7c682c179ce5" UNIQUE ("email"), CONSTRAINT "REL_293c3745fb8ae6909a08878631" UNIQUE ("game_statistic_id"), CONSTRAINT "PK_e36eb77033cfa5d85442fc9395b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ft_user_chat_link" ("id" SERIAL NOT NULL, "user_status" character varying NOT NULL, "datetime_ban_expire" TIMESTAMP, "user_id" integer NOT NULL, "chat_id" integer NOT NULL, CONSTRAINT "PK_d3344fa5f994146ef16dd1b1178" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "userchatlink_user_chat_index" ON "ft_user_chat_link" ("user_id", "chat_id") `);
        await queryRunner.query(`CREATE TABLE "ft_message" ("id" SERIAL NOT NULL, "version" integer NOT NULL, "text" character varying(2000) NOT NULL, "datetime_send" TIMESTAMP NOT NULL DEFAULT now(), "datetime_edit" TIMESTAMP DEFAULT now(), "author_user_id" integer NOT NULL, "target_chat_id" integer NOT NULL, CONSTRAINT "PK_85d594d84509496e7d6219ab10f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ft_chat" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "datetime_create" TIMESTAMP NOT NULL DEFAULT now(), "avatar_file_id" integer, "owner_user_id" integer NOT NULL, CONSTRAINT "PK_2c6a2871a19c5272cf8b3dd5502" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ft_friendship" ADD CONSTRAINT "FK_f30b4b461e64a5e5fe54f83154d" FOREIGN KEY ("invitor_user_id") REFERENCES "ft_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ft_friendship" ADD CONSTRAINT "FK_c9e0a86f533298e634628fe2af7" FOREIGN KEY ("invited_user_id") REFERENCES "ft_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ft_user" ADD CONSTRAINT "FK_293c3745fb8ae6909a088786317" FOREIGN KEY ("game_statistic_id") REFERENCES "ft_game_statistic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ft_user_chat_link" ADD CONSTRAINT "FK_a1ec739a294fc75cbaac11ef45a" FOREIGN KEY ("user_id") REFERENCES "ft_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ft_user_chat_link" ADD CONSTRAINT "FK_df181e49da922167c6714419afb" FOREIGN KEY ("chat_id") REFERENCES "ft_chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ft_message" ADD CONSTRAINT "FK_8f44baac2573b4f6846b75a17ea" FOREIGN KEY ("author_user_id") REFERENCES "ft_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ft_message" ADD CONSTRAINT "FK_4df59efae9ea0da2c726e8c5034" FOREIGN KEY ("target_chat_id") REFERENCES "ft_chat"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ft_chat" ADD CONSTRAINT "FK_c18ed1529e229b2baba4f21fdb7" FOREIGN KEY ("owner_user_id") REFERENCES "ft_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ft_chat" DROP CONSTRAINT "FK_c18ed1529e229b2baba4f21fdb7"`);
        await queryRunner.query(`ALTER TABLE "ft_message" DROP CONSTRAINT "FK_4df59efae9ea0da2c726e8c5034"`);
        await queryRunner.query(`ALTER TABLE "ft_message" DROP CONSTRAINT "FK_8f44baac2573b4f6846b75a17ea"`);
        await queryRunner.query(`ALTER TABLE "ft_user_chat_link" DROP CONSTRAINT "FK_df181e49da922167c6714419afb"`);
        await queryRunner.query(`ALTER TABLE "ft_user_chat_link" DROP CONSTRAINT "FK_a1ec739a294fc75cbaac11ef45a"`);
        await queryRunner.query(`ALTER TABLE "ft_user" DROP CONSTRAINT "FK_293c3745fb8ae6909a088786317"`);
        await queryRunner.query(`ALTER TABLE "ft_friendship" DROP CONSTRAINT "FK_c9e0a86f533298e634628fe2af7"`);
        await queryRunner.query(`ALTER TABLE "ft_friendship" DROP CONSTRAINT "FK_f30b4b461e64a5e5fe54f83154d"`);
        await queryRunner.query(`DROP TABLE "ft_chat"`);
        await queryRunner.query(`DROP TABLE "ft_message"`);
        await queryRunner.query(`DROP INDEX "public"."userchatlink_user_chat_index"`);
        await queryRunner.query(`DROP TABLE "ft_user_chat_link"`);
        await queryRunner.query(`DROP TABLE "ft_user"`);
        await queryRunner.query(`DROP INDEX "public"."friendship_invitor_invited_index"`);
        await queryRunner.query(`DROP TABLE "ft_friendship"`);
        await queryRunner.query(`DROP TABLE "ft_game_statistic"`);
    }

}
