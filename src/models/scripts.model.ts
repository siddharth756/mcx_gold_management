import { DataTypes, Model, Sequelize } from 'sequelize';
import SystemSettings from './systemSettings.model';
import PriceLock from './priceLock.model';

export class Scripts extends Model {
    public id!: string;
    public script_name!: string | null;
    public script_variance!: string | null;
    public system_id!: string | null;
    public is_active!: boolean;
    public created_at!: Date;
    public updated_at!: Date;

    static initModel(connection: Sequelize): void {
        Scripts.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                script_name: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
                script_variance: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: true
                },
                system_id: {
                    type: DataTypes.UUID,
                    allowNull: true,
                    references: {
                        model: 'system_settings',
                        key: 'id'
                    }
                },
                is_active: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true,
                    allowNull: false
                }
            },
            {
                tableName: 'scripts',
                sequelize: connection,
                freezeTableName: true,
                timestamps: true,
                createdAt: 'created_at',
                updatedAt: 'updated_at',
            }
        );

    }

    static initAssociations(): void {
        Scripts.belongsTo(SystemSettings, {
            foreignKey: 'system_id',
            as: "system_settings"
        })

        Scripts.hasMany(PriceLock, {
            foreignKey: "script_id",
            as: "price_lock"
        })
    }

    // static initHooks(): void {
    // }
}

export default Scripts;
