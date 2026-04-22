import { DataTypes, Model, Sequelize } from 'sequelize';
import { ProductType } from '../types/enums';
import Scripts from './scripts.model';

export class SystemSettings extends Model {
    public id!: string;
    public product_type!: ProductType;
    public daily_distribution_limit!: number | null;
    public price_lock_duration!: number | null;
    public instrument_token!: number | null;
    public tax_amount!: number | null;
    public created_by!: string | null;
    public updated_by!: string | null;
    public created_at!: Date;
    public updated_at!: Date;

    static initModel(connection: Sequelize): void {
        SystemSettings.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                product_type: {
                    type: DataTypes.ENUM(...Object.values(ProductType)),
                    allowNull: true,
                },
                daily_distribution_limit: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: true
                },
                price_lock_duration: {
                    type: DataTypes.INTEGER,
                    allowNull: true
                },
                instrument_token: {
                    type: DataTypes.BIGINT,
                    allowNull: true
                },
                tax_amount: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: true
                },
                created_by: {
                    type: DataTypes.UUID,
                    allowNull: true,
                },
                updated_by: {
                    type: DataTypes.UUID,
                    allowNull: true,
                }
            },
            {
                tableName: 'system_settings',
                sequelize: connection,
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );

    }

    static initAssociations(): void {
        SystemSettings.hasMany(Scripts, {
            foreignKey: "system_id",
            as: 'scripts'
        })

        
    }

    // static initHooks(): void {
    // }
}

export default SystemSettings;
