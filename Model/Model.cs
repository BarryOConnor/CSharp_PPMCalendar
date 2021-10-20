using System;
using System.Collections.Generic;


namespace PPMCalendar
{
    public class User
    {
        public int id { get; set; }
        public string fullname { get; set; }
        public int isAdmin { get; set; }
        public string email { get; set; }
        public double totalHolidays { get; set; }
        public double remainingHolidays { get; set; }
        public string phoneNumber { get; set; }
        public string username { get; set; }
        public string password { get; set; }

    }

   
    public class Event
    {
        public int id { get; set; }
        public string title { get; set; }
        public int eventTypeId { get; set; }
        public string invitees { get; set; }
        public int creatorId { get; set; }
        public string startTime { get; set; }
        public string endTime { get; set; }
        public string location { get; set; }
        public string description { get; set; }
        public int? approvedById { get; set; }
        public int approved { get; set; }
        public int notification { get; set; }
        public int repeatDays { get; set; }
        public string repeatUntil { get; set; }
        public int isRepeat { get; set; }
    }

    public class Notification 
    {
        public int userId { get; set; }
        public int eventId { get; set; }
        public string alertTime { get; set; }
    }


    public class EventType
    {
        public int id { get; set; }
        public string name { get; set; }
    }


    public class LoginDetails
    {
        public string username { get; set; }
        public string password { get; set; }
    }

    public class UserList
    {
        public int id { get; set; }
        public string fullname { get; set; }
        public string email { get; set; }
    }

}
