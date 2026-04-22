import { Sequelize } from 'sequelize';
import User from './user.model';
import Branch from './branch.model';
import SystemSettings from './systemSettings.model';
import Scripts from './scripts.model';
import BranchDistributions from './branchDistributions.model';
import DailyDistributions from './dailyDistributions.model';
import DealerDistributions from './dealerDistributions.model';
import PriceLock from './priceLock.model';
import Customer from './customer.model';
import Order from './order.model';

/**
 * Initialize all MySQL models, associations, and hooks
 * @param connection - Sequelize instance
 */
export const initMySQLModels = (connection: Sequelize): void => {
    // Init models here
    User.initModel(connection);
    Branch.initModel(connection);
    SystemSettings.initModel(connection);
    Scripts.initModel(connection);
    BranchDistributions.initModel(connection);
    DailyDistributions.initModel(connection);
    DealerDistributions.initModel(connection);
    PriceLock.initModel(connection);
    Customer.initModel(connection);
    Order.initModel(connection);

    
    // Init associations here
    User.initAssociations();
    Branch.initAssociations();
    SystemSettings.initAssociations();
    Scripts.initAssociations();
    BranchDistributions.initAssociations();
    DailyDistributions.initAssociations();
    DealerDistributions.initAssociations();
    PriceLock.initAssociations();
    Customer.initAssociations();
    Order.initAssociations();

    // Init hooks here
    // User.initHooks();
    // Branch.initHooks();
};

/**
 * Export all models
 */
export {
    User,
    Branch,
    SystemSettings,
    Scripts,
    BranchDistributions,
    DailyDistributions,
    DealerDistributions,
    PriceLock,
    Customer,
    Order
};

