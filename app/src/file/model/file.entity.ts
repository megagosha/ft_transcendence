import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity("ft_file")
export class File {
  public static readonly NAME_LENGTH: number = 150;

  /** Id */
  @PrimaryGeneratedColumn()
  id: number;

  /** Uuid - название файла на сервере */
  @Column({ name: "uuid", type: "uuid", nullable: false })
  uuid: string;

  /** Название исходного файла */
  @Column({
    name: "name",
    length: File.NAME_LENGTH,
    nullable: false,
  })
  name: string;

  /** Тип контента */
  @Column({
    name: "mime_type",
    length: File.NAME_LENGTH,
    nullable: false,
  })
  contentType: string;
}
