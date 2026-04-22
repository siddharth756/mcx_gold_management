import { DataTypes, Model, Sequelize } from 'sequelize';
import User from './user.model';
import BranchDistributions from './branchDistributions.model';
import { ProductType } from '../types/enums';
import Branch from './branch.model';

export class DealerDistributions extends Model {
    public id!: string;
    public dealer_id!: string | null;
    public branch_id!: string | null;
    public branch_distribution_id!: string | null;
    public allocated_quantity_kg!: number | null;
    public sellable_quantity_kg!: number | null;
    public remaining_quantity_kg!: number | null;
    public dealer_variation!: number | null;
    public product_type!: ProductType
    public created_at!: Date;
    public updated_at!: Date;

    static initModel(connection: Sequelize): void {
        DealerDistributions.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                dealer_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'users',
                        key: 'id'
                    }
                },
                branch_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'branches',
                        key: 'id'
                    }    
                },
                branch_distribution_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'branch_distributions',
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
                dealer_variation: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: true,
                },
                product_type: {
                    type: DataTypes.ENUM(...Object.values(ProductType)),
                    allowNull: true,
                },
            },
            {
                tableName: 'dealer_distributions',
                sequelize: connection,
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );

    }

    static initAssociations(): void {
        DealerDistributions.belongsTo(User, {
            foreignKey: 'dealer_id',
            as: "dealer"
        })

        DealerDistributions.belongsTo(BranchDistributions, {
            foreignKey: 'branch_distribution_id',
            as: "branch_distributions"
        })

        DealerDistributions.belongsTo(Branch, {
            foreignKey: 'branch_id',
            as: "branch"
        })
    }

    // static initHooks(): void {
    // }
}

export default DealerDistributions;
