using System;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using MailMessage = System.Net.Mail.MailMessage;

namespace PPMCalendar
{
    public class EmailNotification
    {
        /* Sends an email to the "to" field with the given subject and body */
        public bool SendEmail(string to, string subject, string body)
        {
            try
            {
                MailMessage mail = new MailMessage();
                SmtpClient SC = new SmtpClient("smtp.gmail.com", 587); // details of the SMTP host and port number
                SC.EnableSsl = true;
                SC.DeliveryMethod = SmtpDeliveryMethod.Network;
                SC.UseDefaultCredentials = false;
                SC.Credentials = new System.Net.NetworkCredential("notifications.ppmcalendar", "EZ=J4BTzYVfqUZb"); // the login credentials of the chosen email account

                //set up the email
                mail.To.Add(to); // the to field
                mail.From = new MailAddress("notifications.ppmcalendar@gmail.com");  //the from field
                mail.Subject = subject;  // subject
                mail.Body = body; //contents of the email

                //send the email
                SC.Send(mail);
                return true;
            }
            catch(Exception ex)
            {
                return false;
            }

        }
    }
}
