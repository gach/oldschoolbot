import { BaseEntity, Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class AnalyticsTable extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public timestamp!: number;

	@Column({ type: 'bigint', nullable: true })
	public guildsCount!: number;

	@Column({ type: 'bigint', nullable: true })
	public membersCount!: number;

	@Column({ type: 'int', nullable: true })
	public clueTasksCount!: number;

	@Column({ type: 'int', nullable: true })
	public minigameTasksCount!: number;

	@Column({ type: 'int', nullable: true })
	public monsterTasksCount!: number;

	@Column({ type: 'int', nullable: true })
	public skillingTasksCount!: number;

	@Column({ type: 'int', nullable: true })
	public minionsCount!: number;

	@Column({ type: 'int', nullable: true })
	public ironMinionsCount!: number;

	@Column({ type: 'bigint', nullable: true })
	public totalSacrificed!: number;

	@Column({ type: 'bigint', nullable: true })
	public totalGP!: number;
}
