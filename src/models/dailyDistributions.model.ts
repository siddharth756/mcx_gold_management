import { DataTypes, Model, Sequelize } from 'sequelize';
import { ProductType } from '../types/enums';
import BranchDistributions from './branchDistributions.model';

export class DailyDistributions extends Model {
    public id!: string;
    public date!: Date;
    public product_type!: ProductType;
    public total_quantity_kg!: number | null;
    public created_at!: Date;
    public updated_at!: Date;

    static initModel(connection: Sequelize): void {
        DailyDistributions.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                }, 
                distribution_date: {
                    type: DataTypes.DATEONLY,
                    defaultValue: DataTypes.NOW,
                    allowNull: true,
                },
                product_type: {
                    type: DataTypes.ENUM(...Object.values(ProductType)),
                    allowNull: true, 
                },
                total_quantity_kg: {
                    type: DataTypes.DECIMAL(10, 2),  
                    allowNull: true, 
                },
            },
            {
                tableName: 'daily_distributions',
                sequelize: connection,
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );

    }

    static initAssociations(): void {
        DailyDistributions.hasMany(BranchDistributions, {
            foreignKey: 'daily_distribution_id',
            as: "branch_distributions"
        })
    }

    // static initHooks(): void {
    // }
}

export default DailyDistributions;
