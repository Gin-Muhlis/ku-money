import cron from 'node-cron';
import * as subscriptionDatasource from '../datasource/subscription.datasource.js';
import * as userDatasource from '../datasource/user.datasource.js';
import { sendSubscriptionExpiringEmail, sendSubscriptionExpiredEmail } from './email.service.js';
// 
/**
 * Initialize all scheduled tasks
 */
export const initSchedulers = () => {
  console.log('Initializing schedulers...');

  // Cron job 1: Check for subscriptions expiring in 1 day (runs every 1 minute)
  cron.schedule('* * * * *', async () => {
    console.log('Running scheduler: Check subscriptions expiring in 1 day...');
    try {
      const subscriptions = await subscriptionDatasource.findSubscriptionsExpiringSoon();
      
      console.log(`Found ${subscriptions.length} subscriptions expiring in 1 day`);

      for (const subscription of subscriptions) {
        try {
          const user = await userDatasource.findUserById(subscription.createdBy._id);
          
          if (!user) {
            console.error('User not found for subscription:', subscription._id);
            continue;
          }

          // Check if email already sent today
          const lastEmailSent = subscription.lastExpiringEmailSent;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (lastEmailSent) {
            const lastSentDate = new Date(lastEmailSent);
            lastSentDate.setHours(0, 0, 0, 0);
            
            // Skip if email already sent today
            if (lastSentDate.getTime() === today.getTime()) {
              console.log(`Expiring email already sent today to: ${user.email}`);
              continue;
            }
          }

          // Format expired date
          const expiredDate = new Date(subscription.expiredAt);
          const formattedDate = expiredDate.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

          await sendSubscriptionExpiringEmail(
            user.email,
            user.name,
            formattedDate
          );

          // Update lastExpiringEmailSent
          await subscriptionDatasource.updateSubscription(subscription._id, {
            lastExpiringEmailSent: new Date(),
          });

          console.log(`Expiring email sent to: ${user.email}`);
        } catch (error) {
          console.error('Error sending expiring email:', error);
        }
      }

      console.log('Expiring subscription check completed');
    } catch (error) {
      console.error('Error in expiring subscription scheduler:', error);
    }
  });

  // Cron job 2: Check for subscriptions that just expired (runs every 1 minute)
  cron.schedule('* * * * *', async () => {
    console.log('Running scheduler: Check expired subscriptions...');
    try {
      const subscriptions = await subscriptionDatasource.findJustExpiredSubscriptions();
      
      console.log(`Found ${subscriptions.length} subscriptions that just expired`);

      for (const subscription of subscriptions) {
        try {
          const user = await userDatasource.findUserById(subscription.createdBy._id);
          
          if (!user) {
            console.error('User not found for subscription:', subscription._id);
            continue;
          }

          // Only send email if user is not on free status and email count < 7
          if (user.status !== 'free' && subscription.expiredEmailCount < 7) {
            // Check if email already sent today
            const lastEmailSent = subscription.lastExpiredEmailSent;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (lastEmailSent) {
              const lastSentDate = new Date(lastEmailSent);
              lastSentDate.setHours(0, 0, 0, 0);
              
              // Skip if email already sent today
              if (lastSentDate.getTime() === today.getTime()) {
                console.log(`Expired email already sent today to: ${user.email}`);
                continue;
              }
            }

            const currentEmailCount = subscription.expiredEmailCount;
            

            // Send email
            await sendSubscriptionExpiredEmail(
              user.email,
              user.name
            );

            // Prepare update data
            const updateData = {
              lastExpiredEmailSent: new Date(),
              expiredEmailCount: currentEmailCount + 1,
            };

            // If first email, also set isActive to false
            if (currentEmailCount === 0) {
              updateData.isActive = false;
              console.log(`Subscription ${subscription._id} set to inactive`);
            }

            // Update lastExpiredEmailSent and increment count (and isActive if first email)
            await subscriptionDatasource.updateSubscription(subscription._id, updateData);

            console.log(`Expired email sent to: ${user.email} (${currentEmailCount + 1}/7)`);
          }
        } catch (error) {
          console.error('Error sending expired email:', error);
        }
      }

      console.log('Expired subscription check completed');
    } catch (error) {
      console.error('Error in expired subscription scheduler:', error);
    }
  });

  console.log('Schedulers initialized successfully');
};

