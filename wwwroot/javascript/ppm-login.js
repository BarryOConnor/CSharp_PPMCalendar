
//A lightweight version of the javascript for the login page only

 //twin event listeners to help differentiate between keyboard and mouse users
    document.body.addEventListener('mousedown', function() {
        //user is using a mouse, so remove keyboard styles
        document.body.classList.remove('using-keyboard');
    });

    document.body.addEventListener('keydown', function(event) {
        // Re-enable focus styling when Tab is pressed
        if (event.keyCode === 9) {
            document.body.classList.add('using-keyboard');
        }
    });

//check for dark/light mode cookie and apply automatically
if (getCookie('PPM-darkmode') != null) {
    var myswitch = getCookie('PPM-darkmode');
    if (myswitch == 'light') {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
    } else {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
    }
}


    // used to handle the cookies bar at the top of the page 
    if(getCookie('PPM-cookies')!=null){
        document.getElementById( "cookiebar" ).className = 'hidden';
    } 
/* ----------------------------------------
            Cookie Code
---------------------------------------- */
function acceptCookies(){
/*******************************************************************
* This function is used when a user accepts that the site uses cookies
*
*******************************************************************/
    document.getElementById( "cookiebar" ).className = 'hidden';
    bakeCookie('PPM-cookies','true',30);
}  

function bakeCookie(cookieName, cookieValue, days) {
/*******************************************************************
* This function is used to create a cookie
*
* input:
* cookieName: the name of the cookie
* cookieValue: the value of the cookie
* days: how long until the cookie expires
*******************************************************************/

    var cookieExpires = "";
    if (days) {
        var date = new Date();

        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        cookieExpires = "; expires=" + date.toUTCString();
    }
    document.cookie = cookieName + "=" + (cookieValue || "") + cookieExpires + "; path=/;SameSite=Strict";
}


function getCookie(cookieName) {
/*******************************************************************
* This function is used to retrieve the contents of a cookie
*
* input:
* cookieName: the name of the cookie
*******************************************************************/
    var cookieSearch = cookieName + "=";
    var cookieArray = document.cookie.split(';');

    for (var i = 0; i < cookieArray.length; i++) {
        var cookieElement = cookieArray[i];
        while (cookieElement.charAt(0) == ' ') cookieElement = cookieElement.substring(1, cookieElement.length);
        if (cookieElement.indexOf(cookieSearch) == 0) return cookieElement.substring(cookieSearch.length, cookieElement.length);
    }
    return null;
}


/* ----------------------------------------
            Login Code
---------------------------------------- */


function login(form){
   var xhr = new XMLHttpRequest();
    xhr.open('POST', 'api/user');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var returnInfo = xhr.responseText;
            if (returnInfo == "-1") {
                document.getElementById("login-error").classList.remove("hidden");
            } else {
                bakeCookie('PPM-username',returnInfo,30);
                document.location.href='calendar.html';
            }
        } else if (xhr.status !== 200) {
            alert('Login failed.  Returned status of ' + xhr.status);
        }
    };
    let loginObject = { "username": "", "password": "" };
        
    loginObject.username = document.getElementById("login-username").value;
    loginObject.password = document.getElementById("login-password").value;

    xhr.send(JSON.stringify(loginObject));
}



