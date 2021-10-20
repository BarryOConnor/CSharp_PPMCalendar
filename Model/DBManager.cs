using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Data.SQLite;
using PPMCalendar.Controllers;

namespace PPMCalendar
{
    /* Class to handle database operations */
    public class DBManager : IDisposable
    {
        // create an emailnotification class object to handle emails
        EmailNotification emailNotification = new EmailNotification();
        SQLiteConnection sqlite_conn;
        private const string connectionString = "Data Source=./PPMCalendar.db;Version=3;Foreign Key Constraints=On;";

        public DBManager()
        {
            //create a new database connection
            sqlite_conn = new SQLiteConnection(connectionString);
            sqlite_conn.Open();

            //Enable foreign keys
            SQLiteCommand command = new SQLiteCommand("PRAGMA foreign_keys = ON;", sqlite_conn);
            command.ExecuteNonQuery();

            createSchema();
        }

        public void Dispose() { }

        /* function which creates a new, blank database if no database is found */
        public void createSchema()
        {

            if (!isOpen()) sqlite_conn.Open();

            List<string> tables = new List<string>();

            tables.Add(@"CREATE TABLE IF NOT EXISTS User ( 
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            isAdmin INTEGER NOT NULL DEFAULT 0,
            email TEXT NOT NULL,
            totalHolidays INT NOT NULL,
            remainingHolidays INT NOT NULL,
            phoneNumber TEXT NOT NULL,
            username TEXT NOT NULL,
            password TEXT NOT NULL
            );");

            tables.Add(@"CREATE TABLE IF NOT EXISTS Event (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            eventTypeId INTEGER,
            invitees TEXT DEFAULT '',
            creatorId INTEGER NOT NULL,
            startTime TEXT,
            endTime TEXT,
            location TEXT,
            description TEXT DEFAULT '',
            approvedById INTEGER DEFAULT NULL,
            approved INTEGER DEFAULT 0,
            notification INTEGER DEFAULT 0,
            repeatDays INTEGER DEFAULT 0,
            repeatUntil TEXT DEFAULT '',
            isRepeat INTEGER DEFAULT 0,
            FOREIGN KEY(creatorId) REFERENCES User(id),
            FOREIGN KEY(eventTypeId) REFERENCES EventType(id),
            FOREIGN KEY(approvedById) REFERENCES User(id)
            );");

            tables.Add(@"CREATE TABLE IF NOT EXISTS Repeat (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            eventId INT,
            repeatFrequencyDays INT,
            endDate TEXT,
            FOREIGN KEY(eventId) REFERENCES Event(id)
            );");

            tables.Add(@"CREATE TABLE IF NOT EXISTS Notification (
            userId INTEGER,
            eventId INTEGER,
            alertTime TEXT,
            FOREIGN KEY(eventId) REFERENCES Event(id),
            PRIMARY KEY(userId,eventId)
            );");

            tables.Add(@"CREATE TABLE IF NOT EXISTS EventType (
            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            name TEXT
            );");



            foreach (var table in tables)
            {
                SQLiteCommand command = new SQLiteCommand(table, sqlite_conn);
                command.ExecuteNonQuery();
            }

            sqlite_conn.Close();
        }

        /* Used to write to the database, the dictionary contains the arguments in the query */
        public int Write(string query, Dictionary<string, object> args)
        {
            int numberOfRowsAffected = 0;

            if (!isOpen()) sqlite_conn.Open();

            using (var command = new SQLiteCommand(query, sqlite_conn))
            {
                foreach (var pair in args)
                {
                    command.Parameters.AddWithValue(pair.Key, pair.Value);
                }
                /* return the number of rows affected by the query */
                numberOfRowsAffected = command.ExecuteNonQuery();

                /* if the operation was an insert, return the last inserted ID */
                if (query.Substring(0, 6) == "INSERT")
                {
                    command.Parameters.Clear();
                    command.CommandType = CommandType.Text;
                    command.CommandText = @"select last_insert_rowid()";
                    numberOfRowsAffected = Convert.ToInt32(command.ExecuteScalar());

                }
            }
            
            return numberOfRowsAffected;
        }

        /* handles select statements and returns the selected rows */
        public DataTable Read(string query, Dictionary<string, object> args)
        {
            if (string.IsNullOrEmpty(query.Trim()))
                return null;

            if (!isOpen()) sqlite_conn.Open();

            using (var command = new SQLiteCommand(query, sqlite_conn))
            {

                foreach (KeyValuePair<string, object> entry in args)
                {
                    command.Parameters.AddWithValue(entry.Key, entry.Value);
                }
                var adapter = new SQLiteDataAdapter(command);
                var dt = new DataTable();
                adapter.Fill(dt);
                adapter.Dispose();
                return dt;
            }
        }

        private bool isOpen() { return sqlite_conn.State == ConnectionState.Open; }

        #region User queries
        /********************************************
         *               USER QUERIES
         * *****************************************/

        /* Add a user to the database */
        public int AddUser(User user)
        {

            const string query = "INSERT INTO User(fullname, isAdmin, email, totalHolidays, remainingHolidays, phoneNumber, username, password) " +
                "VALUES(@fullname,@isAdmin,@email,@totalHolidays,@remainingHolidays,@phoneNumber,@username,@password)";

            //here we are setting the parameter values that will be actually 
            var args = new Dictionary<string, object>
            {
                {"@fullname", user.fullname},
                {"@isAdmin", user.isAdmin},
                {"@email", user.email },
                {"@totalHolidays", user.totalHolidays },
                {"@remainingHolidays", user.remainingHolidays },
                {"@phoneNumber", user.phoneNumber },
                {"@username", user.username },
                {"@password", user.password }
            };

            return Write(query, args);
        }

        /* update an existing user */
        public int UpdateUser(User user)
        {
            const string query = "UPDATE User SET fullname = @fullname, isAdmin = @isAdmin, email = @email, totalHolidays = @totalHolidays, " +
                "remainingHolidays = @remainingHolidays, phoneNumber = @phoneNumber, username = @username, password = @password WHERE id = @id; ";
            // sends email about event updated
            //new EmailController(3, thisevent.id);
            //here we are setting the parameter values that will be actually 
            var args = new Dictionary<string, object>
            {
                {"@id", user.id},
                {"@fullname", user.fullname},
                {"@isAdmin", user.isAdmin},
                {"@email", user.email },
                {"@totalHolidays", user.totalHolidays },
                {"@remainingHolidays", user.remainingHolidays },
                {"@phoneNumber", user.phoneNumber },
                {"@username", user.username },
                {"@password", user.password }
            };

            return Write(query, args);
        }

        /* delete an existing user */
        public int DeleteUser(int id)
        {

            const string query = @"DELETE FROM User WHERE Id = @id;";

            //These wont be used
            var args = new Dictionary<string, object>
            {
                {"@id", id}
            };

            return Write(query, args);
        }

        /* get a list of current users in the system */
        public List<UserList> GetUsers()
        {

            List<UserList> users = new List<UserList>();


            var query = "";


            query = @"SELECT id, fullname, email FROM user ORDER BY fullname ASC;";

            var args = new Dictionary<string, object>
            {
  
            };


            DataTable table = Read(query, args);
            if (table.Rows.Count == 0) return null;

            for (int i = 0; i < table.Rows.Count; i++)
            {
                var tUser = new UserList
                {
                    id = Convert.ToInt32(table.Rows[i]["id"]),
                    fullname = Convert.ToString(table.Rows[i]["fullname"]),
                    email = Convert.ToString(table.Rows[i]["email"])

                };
                users.Add(tUser);
            }


            return users;
        }

        /* Add a user based on their id */
        public List<User> GetUserById(int id)
        {
            var query = @"SELECT * FROM User WHERE Id = @id;";
            List<User> users = new List<User>();
            var args = new Dictionary<string, object>
            {
                {"@id", id}
            };

            DataTable table = Read(query, args);
            if (table.Rows.Count == 0) return null;

            for (int i = 0; i < table.Rows.Count; i++)
            {
                var tUser = new User
                {
                    id = Convert.ToInt32(table.Rows[0]["id"]),
                    fullname = Convert.ToString(table.Rows[0]["fullname"]),
                    isAdmin = Convert.ToInt32(table.Rows[0]["isAdmin"]),
                    email = Convert.ToString(table.Rows[0]["email"]),
                    totalHolidays = Convert.ToInt32(table.Rows[0]["totalHolidays"]),
                    remainingHolidays = Convert.ToInt32(table.Rows[0]["remainingHolidays"]),
                    phoneNumber = Convert.ToString(table.Rows[0]["phoneNumber"]),
                    username = Convert.ToString(table.Rows[0]["username"]),
                    password = Convert.ToString(table.Rows[0]["password"])
                };
                users.Add(tUser);
            }


            return users;

        }

        /* Add a user based oin their username */
        public User GetUserByUsername(string username)
        {
            var query = @"SELECT * FROM User WHERE username = @username;";
            var args = new Dictionary<string, object> {
                {"@username", username}
            };

            DataTable table = Read(query, args);

            if (table == null || table.Rows.Count <= 0) return null;

            var user = new User
            {
                id = Convert.ToInt32(table.Rows[0]["id"]),
                fullname = Convert.ToString(table.Rows[0]["fullname"]),
                isAdmin = Convert.ToInt32(table.Rows[0]["isAdmin"]),
                email = Convert.ToString(table.Rows[0]["email"]),
                totalHolidays = Convert.ToInt32(table.Rows[0]["totalHolidays"]),
                remainingHolidays = Convert.ToInt32(table.Rows[0]["remainingHolidays"]),
                phoneNumber = Convert.ToString(table.Rows[0]["phoneNumber"]),
                username = Convert.ToString(table.Rows[0]["username"]),
                password = Convert.ToString(table.Rows[0]["password"])
            };

            return user;
        }


        #endregion

        #region Event queries
        /********************************************
        *               Repeat QUERIES
        * *****************************************/
        /* Create a recurring event */
        public void CreateRepeat(Event thisevent, int parentId)
        {
            const string query = "INSERT INTO Event(title, eventTypeId, invitees, creatorId, startTime, endTime, location, description, approvedById, approved, notification, repeatDays, repeatUntil, isRepeat) " +
                "VALUES(@title, @eventTypeId, @invitees, @creatorId, @startTime, @endTime, @location, @description, @approvedById, @approved, @notification, @repeatDays, @repeatUntil, @isRepeat)";

            DateTime startDate = DateTime.Parse(thisevent.startTime);
            DateTime endDate = DateTime.Parse(thisevent.endTime);
            DateTime repeatUntil = DateTime.Parse(thisevent.repeatUntil);
            int days = thisevent.repeatDays;
            
            if(repeatUntil > startDate)
            {
                startDate = startDate.AddDays(days);
                endDate = endDate.AddDays(days);

                while (startDate <= repeatUntil)
                {
                    var dictionary = new Dictionary<string, object>
                    {
                        {"@id", thisevent.id },
                        {"@title", thisevent.title },
                        {"@eventTypeId", thisevent.eventTypeId },
                        {"@invitees", thisevent.invitees },
                        {"@creatorId", thisevent.creatorId },
                        {"@startTime", startDate.ToString("yyyy-MM-dd HH:mm:ss") },
                        {"@endTime", endDate.ToString("yyyy-MM-dd HH:mm:ss") },
                        {"@location", thisevent.location },
                        {"@description", thisevent.description },
                        {"@approvedById", thisevent.approvedById },
                        {"@approved", thisevent.approved },
                        {"@notification", 0 },
                        {"@repeatDays", 0 },
                        {"@repeatUntil", thisevent.repeatUntil },
                        {"@isRepeat", parentId }

                    };
                    
                    startDate = startDate.AddDays(days);
                    endDate = endDate.AddDays(days);
                    Write(query, dictionary);
                }

            }

           

        }

        /********************************************
        *               EVENT QUERIES
        * *****************************************/
        /* Add an event to the database */
        public int AddEvent(Event thisevent)
        {
            int returnVal = 0;
            const int APPROVED = 1;
            const int REJECTED = 2;
            const int PERSONAL_HOLIDAY = 1;
            const int HOLIDAY_REQUEST = 9;
            const int REJECTED_HOLIDAY = 10;

            const string query = "INSERT INTO Event(title, eventTypeId, invitees, creatorId, startTime, endTime, location, description, approvedById, approved, notification, repeatDays, repeatUntil, isRepeat) " +
                "VALUES(@title, @eventTypeId, @invitees, @creatorId, @startTime, @endTime, @location, @description, @approvedById, @approved, @notification, @repeatDays, @repeatUntil, @isRepeat)";

            //here we are setting the parameter values that will be actually 
            if (thisevent.approvedById == 0) thisevent.approvedById = null;
            var args = new Dictionary<string, object>
            {
                {"@id", thisevent.id},
                {"@title", thisevent.title},
                {"@eventTypeId", thisevent.eventTypeId},
                {"@invitees", thisevent.invitees },
                {"@creatorId", thisevent.creatorId },
                {"@startTime", thisevent.startTime },
                {"@endTime", thisevent.endTime },
                {"@location", thisevent.location },
                {"@description", thisevent.description },
                {"@approvedById", thisevent.approvedById },
                {"@approved", thisevent.approved },
                {"@notification", thisevent.notification },
                {"@repeatDays", thisevent.repeatDays },
                {"@repeatUntil", thisevent.repeatUntil },
                {"@isRepeat", thisevent.isRepeat }

            };

            returnVal = Write(query, args);
            if (returnVal != 0)
            {
                //find all recipients
                List<string> emailRecipients = thisevent.invitees.Split(',').ToList<string>();

                string subject = "";

                // create notifications for the event and send out emails to those involved
                if (thisevent.eventTypeId == HOLIDAY_REQUEST)
                {
                    subject = "A holiday request has been submitted";
                } else
                {
                    subject = "You have been invited to an event - " + thisevent.title;
                }

                string body = "Name: " + thisevent.title + "\n" +
                              "Location: " + thisevent.location + "\n" +
                              "Description: " + thisevent.description + "\n\n" +
                              "Start time: " + thisevent.startTime + "\n" +
                              "End time: " + thisevent.endTime;

                if (emailRecipients.Count > 0)
                {

                    foreach (string recipient in emailRecipients)
                    {
                        Console.WriteLine("Sending email to: " + recipient);
                        emailNotification.SendEmail(recipient, subject, body);
                    }


                }

                // add any reminders that were requested
                Notification notification = new Notification();
                var date = DateTime.Parse(thisevent.startTime);

                date = date.AddMinutes(0 - thisevent.notification);

                notification.userId = thisevent.creatorId;
                notification.eventId = returnVal;
                notification.alertTime = date.ToString("yyyy-MM-dd HH:mm:ss");

                AddNotification(notification);
                

                // handle the recurring events if needed
                if (thisevent.isRepeat == 0 && thisevent.repeatDays != 0)
                {
                    CreateRepeat(thisevent, returnVal);
                }
            }
            

            return returnVal;

        }

        /* Update an event in the database */
        public int UpdateEvent(Event thisevent)
        {
            const int APPROVED = 1;
            const int REJECTED = 2;
            const int PERSONAL_HOLIDAY = 1;
            const int HOLIDAY_REQUEST = 9;
            const int REJECTED_HOLIDAY = 10;

            const string query = "UPDATE Event SET title = @title, eventTypeId = @eventTypeId, invitees = @invitees, creatorId = @creatorId, " +
                "startTime = @startTime, endTime = @endTime, location = @location, description = @description, approvedById = @approvedById, " +
                "approved = @approved, notification=@notification, repeatDays=@repeatDays, repeatUntil=@repeatUntil, isRepeat=@isRepeat WHERE id = @id; ";
            // sends email about event updated
            

            int returnValue = 0;
            //handle the approval/rejection of Holiday Requests
            if(thisevent.approvedById != 0)
            {
                if((thisevent.eventTypeId == HOLIDAY_REQUEST || thisevent.eventTypeId == REJECTED_HOLIDAY) && thisevent.approved == APPROVED) { 
                    thisevent.eventTypeId = PERSONAL_HOLIDAY;
                    List<User> tUser = GetUserById(thisevent.creatorId);
                    tUser[0].remainingHolidays--;
                    UpdateUser(tUser[0]);
                }
                if(thisevent.eventTypeId == PERSONAL_HOLIDAY && thisevent.approved == REJECTED)
                {
                    thisevent.eventTypeId = REJECTED_HOLIDAY;
                    List<User> tUser = GetUserById(thisevent.creatorId);
                    tUser[0].remainingHolidays++;
                    UpdateUser(tUser[0]);
                }
                if (thisevent.eventTypeId == HOLIDAY_REQUEST && thisevent.approved == REJECTED)
                {
                    thisevent.eventTypeId = REJECTED_HOLIDAY;
                }
            } else
            {
                thisevent.approvedById = null;
            }

            var args = new Dictionary<string, object>
            {
                {"@id", thisevent.id},
                {"@title", thisevent.title},
                {"@eventTypeId", thisevent.eventTypeId},
                {"@invitees", thisevent.invitees },
                {"@creatorId", thisevent.creatorId },
                {"@startTime", thisevent.startTime },
                {"@endTime", thisevent.endTime },
                {"@location", thisevent.location },
                {"@description", thisevent.description },
                {"@approvedById", thisevent.approvedById },
                {"@approved", thisevent.approved },
                {"@notification", thisevent.notification },
                {"@repeatDays", thisevent.repeatDays },
                {"@repeatUntil", thisevent.repeatUntil },
                {"@isRepeat", thisevent.isRepeat }
            };
            
            returnValue = Write(query, args);
            //handle the notifications neeeded for the event
            if (returnValue != 0)
            {
                List<string> emailRecipients = thisevent.invitees.Split(',').ToList<string>();
                string subject = "An event has been changed - " + thisevent.title;
                string body = "Name: " + thisevent.title + "\n" +
                              "Location: " + thisevent.location + "\n" +
                              "Description: " + thisevent.description + "\n\n" +
                              "Start time: " + thisevent.startTime + "\n" +
                              "End time: " + thisevent.endTime;

                if (emailRecipients.Count > 0)
                {

                    foreach (string recipient in emailRecipients)
                    {
                        Console.WriteLine("Sending email to: " + recipient);
                        emailNotification.SendEmail(recipient, subject, body);
                    }


                }

                //handle any requested reminders
                Notification notification = new Notification();
                var date = DateTime.Parse(thisevent.startTime);

                date = date.AddMinutes(0 - thisevent.notification);

                notification.userId = thisevent.creatorId;
                notification.eventId = thisevent.id;
                notification.alertTime = date.ToString();

                AddNotification(notification);

            }
            
            
            return returnValue;
        }

        /*Delete an event from the database */

        public int DeleteEvent(int id)
        {
            List<Event> tEvent = GetEventById(id);
            const string query = @"DELETE FROM Event WHERE Id = @id;";

            int returnValue = 0;
            var args = new Dictionary<string, object>
            {
                {"@id", id}
            };

            returnValue = Write(query, args);
            if (returnValue != 0)
            {
                DeleteNotification(tEvent[0].creatorId, tEvent[0].id);

                List<string> emailRecipients = tEvent[0].invitees.Split(',').ToList<string>();
                string subject = "An event has been cancelled - " + tEvent[0].title;
                string body = "Name: " + tEvent[0].title + "\n" +
                              "Location: " + tEvent[0].location + "\n" +
                              "Description: " + tEvent[0].description + "\n\n" +
                              "Start time: " + tEvent[0].startTime + "\n" +
                              "End time: " + tEvent[0].endTime;

                if (emailRecipients.Count > 0)
                {

                    foreach (string recipient in emailRecipients)
                    {
                        Console.WriteLine("Sending email to: " + recipient);
                        emailNotification.SendEmail(recipient, subject, body);
                    }


                }

            }


            return returnValue;
        }

        /* get an event from the database based on user ID and dates */
        public List<Event> GetEvent(int userId, string fromDate, string toDate)
        {
            List<Event> events = new List<Event>();
            List<User> tUser = new List<User>();

            tUser = GetUserById(userId);
            var query = "";

            fromDate += " 00:00:00";
            toDate += " 23:59:59";

            query = @"SELECT id, title, eventTypeId, invitees, creatorId, startTime, endTime, location, description, approvedById, approved, notification, repeatDays, repeatUntil, isRepeat FROM Event WHERE (creatorId = @id OR invitees LIKE '%@email%' OR eventTypeId = 1) AND startTime BETWEEN @fromDate AND @toDate ORDER BY startTime ASC;";

            var args = new Dictionary<string, object>
            {
                {"@id", userId},
                {"@email", tUser[0].email},
                {"@fromDate",fromDate},
                {"@toDate",toDate}
            };

            DataTable table = Read(query, args);
            if (table.Rows.Count == 0) return null;

            for (int i = 0; i < table.Rows.Count; i++) {
                if (Convert.IsDBNull(table.Rows[i]["invitees"])) table.Rows[i]["invitees"] = "";
                if (Convert.IsDBNull(table.Rows[i]["description"])) table.Rows[i]["description"] = "";
                if (Convert.IsDBNull(table.Rows[i]["approvedById"])) table.Rows[i]["approvedById"] = "0";
                if (Convert.IsDBNull(table.Rows[i]["repeatUntil"])) table.Rows[i]["repeatUntil"] = "";
                var tEvent = new Event
                {
                    id = Convert.ToInt32(table.Rows[i]["id"]),
                    title = Convert.ToString(table.Rows[i]["title"]),
                    eventTypeId = Convert.ToInt32(table.Rows[i]["eventTypeId"]),
                    invitees = Convert.ToString(table.Rows[i]["invitees"]),
                    creatorId = Convert.ToInt32(table.Rows[i]["creatorId"]),
                    startTime = Convert.ToString(table.Rows[i]["startTime"]),
                    endTime = Convert.ToString(table.Rows[i]["endTime"]),
                    location = Convert.ToString(table.Rows[i]["location"]),
                    description = Convert.ToString(table.Rows[i]["description"]),
                    approvedById = Convert.ToInt32(table.Rows[i]["approvedById"]),
                    approved = Convert.ToInt32(table.Rows[i]["approved"]),
                    notification = Convert.ToInt32(table.Rows[i]["notification"]),
                    repeatDays = Convert.ToInt32(table.Rows[i]["repeatDays"]),
                    repeatUntil = Convert.ToString(table.Rows[i]["repeatUntil"]),
                    isRepeat = Convert.ToInt32(table.Rows[i]["isRepeat"])
                };
                events.Add(tEvent);
            }


            return events;
        }

        /* get an event from the database based on event ID */
        public List<Event> GetEventById(int eventId)
        {

            List<Event> events = new List<Event>();

            var query = @"SELECT id, title, eventTypeId, invitees, creatorId, startTime, endTime, location, description, approvedById, approved, notification, repeatDays, repeatUntil, isRepeat FROM Event WHERE id = @id;";

            var args = new Dictionary<string, object>
            {
                {"@id", eventId}
            };

            DataTable table = Read(query, args);
            if (table.Rows.Count == 0) return null;

            for (int i = 0; i < table.Rows.Count; i++)
            {
                if (Convert.IsDBNull(table.Rows[i]["invitees"])) table.Rows[i]["invitees"] = "";
                if (Convert.IsDBNull(table.Rows[i]["description"])) table.Rows[i]["description"] = "";
                if (Convert.IsDBNull(table.Rows[i]["approvedById"])) table.Rows[i]["approvedById"] = "0";
                if (Convert.IsDBNull(table.Rows[i]["repeatUntil"])) table.Rows[i]["repeatUntil"] = "";
                var tEvent = new Event
                {
                    id = Convert.ToInt32(table.Rows[i]["id"]),
                    title = Convert.ToString(table.Rows[i]["title"]),
                    eventTypeId = Convert.ToInt32(table.Rows[i]["eventTypeId"]),
                    invitees = Convert.ToString(table.Rows[i]["invitees"]),
                    creatorId = Convert.ToInt32(table.Rows[i]["creatorId"]),
                    startTime = Convert.ToString(table.Rows[i]["startTime"]),
                    endTime = Convert.ToString(table.Rows[i]["endTime"]),
                    location = Convert.ToString(table.Rows[i]["location"]),
                    description = Convert.ToString(table.Rows[i]["description"]),
                    approvedById = Convert.ToInt32(table.Rows[i]["approvedById"]),
                    approved = Convert.ToInt32(table.Rows[i]["approved"]),
                    notification = Convert.ToInt32(table.Rows[i]["notification"]),
                    repeatDays = Convert.ToInt32(table.Rows[i]["repeatDays"]),
                    repeatUntil = Convert.ToString(table.Rows[i]["repeatUntil"]),
                    isRepeat = Convert.ToInt32(table.Rows[i]["isRepeat"])
                };
                events.Add(tEvent);
            }


            return events;
        }

        // new function to check events happening in the next hour
        public List<Event> GetEventByTime()
        {
            List<Event> events = new List<Event>();

            var query = @"SELECT id, title, eventTypeId, invitees, creatorId, startTime, endTime, location, description, approvedById, approved, notification, repeatDays, repeatUntil, isRepeat FROM Event WHERE startTime >= @startTime AND endTime <= @endTime;";

            var args = new Dictionary<string, object>
            {
                {"@startTime", DateTime.Now},
                {"@endTime", DateTime.Now.AddHours(1)}
            };

            DataTable table = Read(query, args);
            if (table.Rows.Count == 0) return null;

            for (int i = 0; i < table.Rows.Count; i++)
            {
                if (Convert.IsDBNull(table.Rows[i]["invitees"])) table.Rows[i]["invitees"] = "";
                if (Convert.IsDBNull(table.Rows[i]["description"])) table.Rows[i]["description"] = "";
                if (Convert.IsDBNull(table.Rows[i]["approvedById"])) table.Rows[i]["approvedById"] = "0";
                if (Convert.IsDBNull(table.Rows[i]["repeatUntil"])) table.Rows[i]["repeatUntil"] = "";
                var tEvent = new Event
                {
                    id = Convert.ToInt32(table.Rows[i]["id"]),
                    title = Convert.ToString(table.Rows[i]["title"]),
                    eventTypeId = Convert.ToInt32(table.Rows[i]["eventTypeId"]),
                    invitees = Convert.ToString(table.Rows[i]["invitees"]),
                    creatorId = Convert.ToInt32(table.Rows[i]["creatorId"]),
                    startTime = Convert.ToString(table.Rows[i]["startTime"]),
                    endTime = Convert.ToString(table.Rows[i]["endTime"]),
                    location = Convert.ToString(table.Rows[i]["location"]),
                    description = Convert.ToString(table.Rows[i]["description"]),
                    approvedById = Convert.ToInt32(table.Rows[i]["approvedById"]),
                    approved = Convert.ToInt32(table.Rows[i]["approved"]),
                    notification = Convert.ToInt32(table.Rows[i]["notification"]),
                    repeatDays = Convert.ToInt32(table.Rows[i]["repeatDays"]),
                    repeatUntil = Convert.ToString(table.Rows[i]["repeatUntil"]),
                    isRepeat = Convert.ToInt32(table.Rows[i]["isRepeat"])
                };
                events.Add(tEvent);
            }
            return events;
        }

        /* get events from most recent to oldest */
        public List<Event> GetRecentEvent()
        {
            List<Event> events = new List<Event>();

            var query = @"SELECT TOP 1 * FROM Event ORDER BY ID DESC";

            var args = new Dictionary<string, object>
            {

            };
            DataTable table = Read(query, args);

            if (table.Rows.Count == 0) return null;

            for (int i = 0; i < table.Rows.Count; i++)
            {
                if (Convert.IsDBNull(table.Rows[i]["invitees"])) table.Rows[i]["invitees"] = "";
                if (Convert.IsDBNull(table.Rows[i]["description"])) table.Rows[i]["description"] = "";
                if (Convert.IsDBNull(table.Rows[i]["approvedById"])) table.Rows[i]["approvedById"] = "0";
                if (Convert.IsDBNull(table.Rows[i]["repeatUntil"])) table.Rows[i]["repeatUntil"] = "";
                var tEvent = new Event
                {
                    id = Convert.ToInt32(table.Rows[i]["id"]),
                    title = Convert.ToString(table.Rows[i]["title"]),
                    eventTypeId = Convert.ToInt32(table.Rows[i]["eventTypeId"]),
                    invitees = Convert.ToString(table.Rows[i]["invitees"]),
                    creatorId = Convert.ToInt32(table.Rows[i]["creatorId"]),
                    startTime = Convert.ToString(table.Rows[i]["startTime"]),
                    endTime = Convert.ToString(table.Rows[i]["endTime"]),
                    location = Convert.ToString(table.Rows[i]["location"]),
                    description = Convert.ToString(table.Rows[i]["description"]),
                    approvedById = Convert.ToInt32(table.Rows[i]["approvedById"]),
                    approved = Convert.ToInt32(table.Rows[i]["approved"]),
                    notification = Convert.ToInt32(table.Rows[i]["notification"]),
                    repeatDays = Convert.ToInt32(table.Rows[i]["repeatDays"]),
                    repeatUntil = Convert.ToString(table.Rows[i]["repeatUntil"]),
                    isRepeat = Convert.ToInt32(table.Rows[i]["isRepeat"])
                };
                events.Add(tEvent);
            }
            return events;
        }

        #endregion
        /********************************************
         *               EVENT TYPE QUERIES
         * *****************************************/

        public List<EventType> GetEventTypes()
        {
            List<EventType> events = new List<EventType>();

            var query = "";

            query = @"SELECT id, name FROM eventType;";

            var args = new Dictionary<string, object>
            {

            };

            DataTable table = Read(query, args);
            if (table.Rows.Count == 0) return null;

            for (int i = 0; i < table.Rows.Count; i++)
            {
                var tEventType = new EventType
                {
                    id = Convert.ToInt32(table.Rows[i]["id"]),
                    name = Convert.ToString(table.Rows[i]["name"])
                };
                events.Add(tEventType);
            }

            return events;
        }


        /********************************************
        *               NOTIFICATION QUERIES
        * *****************************************/
        public List<Notification> GetNotifications()
        {
            List<Notification> notifications = new List<Notification>();
            var query = @"SELECT * FROM Notification WHERE alertTime BETWEEN Datetime('now', '-10 minutes', 'localtime') AND Datetime('now', 'localtime');";

            var args = new Dictionary<string, object>
            {

            };

            DataTable table = Read(query, args);
            if (table.Rows.Count == 0) return null;

            for (int i = 0; i < table.Rows.Count; i++)
            {
                var notifcation = new Notification
                {
                    userId = Convert.ToInt32(table.Rows[i]["userId"]),
                    eventId = Convert.ToInt32(table.Rows[i]["eventId"]),
                    alertTime = Convert.ToString(table.Rows[i]["alertTime"])
                };

            notifications.Add(notifcation);
            }

            return notifications;

        }

        public List<Notification> GetNotification(int userId, int eventId)
        {
            List<Notification> notifications = new List<Notification>();
            var query = @"SELECT userId, eventId, alertTime FROM Notification WHERE userId=@userId AND eventId=@eventId;";

            var args = new Dictionary<string, object>
            {
                {"@userId", userId },
                {"@eventId", eventId }
            };

            DataTable table = Read(query, args);
            if (table.Rows.Count == 0) return null;

            for (int i = 0; i < table.Rows.Count; i++)
            {
                var notifcation = new Notification
                {
                    userId = Convert.ToInt32(table.Rows[i]["userId"]),
                    eventId = Convert.ToInt32(table.Rows[i]["eventId"]),
                    alertTime = Convert.ToString(table.Rows[i]["alertTime"])
                };

                notifications.Add(notifcation);
            }

            return notifications;

        }

        public int AddNotification(Notification notification)
        {
            //check the notification exists, if not create it
            if (GetNotification(notification.userId, notification.eventId) == null)
            {
                const string query2 = "INSERT INTO Notification(userId, eventId, alertTime) VALUES (@userId, @eventId, @alertTime);";

                //here we are setting the parameter values that will be actually 
                var args2 = new Dictionary<string, object>
                {
                    {"@userId", notification.userId },
                    {"@eventId", notification.eventId },
                    {"@alertTime", notification.alertTime }
                };

                return Write(query2, args2);
            } else  
            {
                //if it does exist, just update the value
                return UpdateNotification(notification);
            }
        }

        public int UpdateNotification(Notification notification)
        {

            const string query = "UPDATE Notification SET alertTime=@alertTime WHERE userId=@userId AND eventId=@eventId;";

            //here we are setting the parameter values that will be actually 
            var args = new Dictionary<string, object>
             {
                {"@userId", notification.userId },
                {"@eventId", notification.eventId },
                {"@alertTime", notification.alertTime }
            };

            return Write(query, args);
        }

        public int DeleteNotification(int userId, int eventId)
        {
            // sends email with event that is about to be deleted
            //new EmailController(2,id);
            const string query = @"DELETE from Notification WHERE userId = @userId AND eventId = @eventId;";

            //These wont be used
            var args = new Dictionary<string, object>
            {
                {"@userId", userId },
                {"@eventId", eventId }
            };

            return Write(query, args);
        }
    }
}




