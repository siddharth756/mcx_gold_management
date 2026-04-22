import { DataTypes, Model, Sequelize } from 'sequelize';
import DailyDistributions from './dailyDistributions.model';
import Branch from './branch.model';
import DealerDistributions from './dealerDistributions.model';

export class BranchDistributions extends Model {
    public id!: string;
    public branch_id!: string | null;
    public daily_distribution_id!: string | null;
    public allocated_quantity_kg!: number | null;
    public sellable_quantity_kg!: number | null;
    public remaining_quantity_kg!: number | null;
    public branch_variation!: number | null;
    public created_at!: Date;
    public updated_at!: Date;

    static initModel(connection: Sequelize): void {
        BranchDistributions.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                branch_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'branches',
                        key: 'id'
                    }
                },
                daily_distribution_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'daily_distributions',
                        key: 'id'
                    }
                },
                allocated_quantity_kg: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: true,
                },
                sellable_quantity_kg: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: true,
                },
                remaining_quantity_kg: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: true,
                },
                branch_variation: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: true,
                }
            },
            {
                tableName: 'branch_distributions',
                sequelize: connection,
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );

    }

    static initAssociations(): void {
        BranchDistributions.belongsTo(Branch, {
            foreignKey: 'branch_id',
            as: "branch"
        })

        BranchDistributions.belongsTo(DailyDistributions, {
            foreignKey: 'daily_distribution_id',
            as: "daily_distributions"
        })

        BranchDistributions.hasMany(DealerDistributions, {
            foreignKey: 'branch_distribution_id',
            as: "dealer_distributions"
        })
    }

    // static initHooks(): void {
    // }
}

export default BranchDistributions;
