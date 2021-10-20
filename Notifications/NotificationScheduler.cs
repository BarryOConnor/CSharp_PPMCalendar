using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace PPMCalendar
{
    public class NotificationScheduler
    {

        EmailNotification notification = new EmailNotification();
        int checkEvery = 5;


        public Task Start(CancellationToken token)
        {
            /* task to handle the notification schedule event */
            Task.Run(RunNotificationSchedule);
            return Task.CompletedTask;
        }

        private async Task RunNotificationSchedule()
        {



            while (true)
            {

                using (DBManager db = new DBManager())
                {
                    try
                    {

                        while (true)
                        {
                            var date = DateTime.Now;
                            if (date.Minute % 5 == 0 || date.Minute == 0) break; /* forces the event to occur at intervals of 5 minutes when divisible by 5 */
                            else
                            {
                                Console.WriteLine("Not at 5 minutes yet");
                            }
                            Thread.Sleep(30000); // sleep for 30 seconds
                        }

                        //check if there are any notifications ready to be processed
                        List<Notification> pendingNotifications = db.GetNotifications();

                        foreach (Notification pendingNotification in pendingNotifications)
                        {
                            List<User> tUser = db.GetUserById(pendingNotification.userId);
                            List<Event> tEvent = db.GetEventById(pendingNotification.eventId);
                            DateTime localTime = DateTime.Now;

                           // send an email to the recipients, reminding them of their event     
                            string subject = "Upcoming event - " + tEvent[0].title;
                            string body = "Name: " + tEvent[0].title + "\n" +
                                              "Location: " + tEvent[0].location + "\n" +
                                              "Description: " + tEvent[0].description + "\n\n" +
                                              "Start time: " + tEvent[0].startTime + "\n" +
                                              "End time: " + tEvent[0].endTime;

                            Console.WriteLine("Sending email to: " + tUser[0].email);
                            notification.SendEmail(tUser[0].email, subject, body);

                            //remove the notification from the database to ensure no repeat emails are sent
                            db.DeleteNotification(pendingNotification.userId, pendingNotification.eventId);
                        }

                    }
                    catch (Exception ex)
                    {

                    }
                }

                Thread.Sleep(checkEvery * (1000 * 60));  // check ever minute

            }

        }
    }
}
