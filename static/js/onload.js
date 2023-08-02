var tmout = null;
var mustReload = false;

function Resizing()
{
    if (tmout != null)
    {
        clearTimeout(tmout);
    }
    tmout = setTimeout(RefreshAll,300);
}
function Reload()
{
    document.location.href = document.location.href;
}
//IE fires the window's onresize event when the client area
//expands or contracts, which causes an infinite loop.
//the way around this is a hidden div set to 100% of
//height and width, with a guard around the resize event
//handler to see if the _window_ size really changed
var windowHeight;
var windowWidth;
window.onresize = null;
window.onresize = function()
{
    var backdropDiv = document.getElementById("divBackdrop");
    if (windowHeight != backdropDiv.offsetHeight ||
        windowWidth != backdropDiv.offsetWidth)
    {
        //if screen is shrinking, must reload to get correct sizes
        if (windowHeight != backdropDiv.offsetHeight ||
            windowWidth != backdropDiv.offsetWidth)
        {
            mustReload = true;
        }
        else
        {
            mustReload = mustReload || false;
        }
        windowHeight = backdropDiv.offsetHeight;
        windowWidth = backdropDiv.offsetWidth;
        Resizing();
    }
}

var isWorking = false;
var currentEntity = <%=currentEntityId %>;

//try to detect a bad back-button usage;
//if the current entity id does not match the querystring
//parameter entityid=###
if (location.search != null && location.search.indexOf("&entityid=") > 0)
{
    var urlId = location.search.substring(
        location.search.indexOf("&entityid=")+10);
    if (urlId.indexOf("&") > 0)
    {
        urlId = urlId.substring(0,urlId.indexOf("&"));
    }
    if (currentEntity != urlId)
    {
        mustReload = true;
    }
}
//a friendly please wait... hidden div
var pleaseWaitDiv = document.getElementById("divPleaseWait");
//an example content div being refreshed via AJAX PRO
var contentDiv = document.getElementById("contentDiv");

//synchronous refresh of content
function RefreshAll()
{
    if (isWorking) { return; }  //no infinite recursion please!

    isWorking = true;
    pleaseWaitDiv.style.visibility = "visible";

    if (mustReload)
    {
        Reload();
    }
    else
    {
        contentDiv.innerHTML = NAMESPACE.REFRESH_METHOD(
            (currentEntity, contentDiv.offsetWidth,
             contentDiv.offsetHeight).value;
    }

    pleaseWaitDiv.style.visibility = "hidden";
    isWorking = false;
    if (tmout != null)
    {
        clearTimeout(tmout);
    }
}

var tmout2 = null;
var refreshInterval = 60000;

//periodic synchronous refresh of all content
function Refreshing()
{
    RefreshAll();
    if (tmout2 != null)
    {
        clearTimeout(tmout2);
        tmout2 = setTimeout(Refreshing,refreshInterval);
    }
}

//start periodic refresh of content
tmout2 = setTimeout(Refreshing,refreshInterval);

//clean up
window.onunload = function()
{
    isWorking = true;
    if (tmout != null)
    {
        clearTimeout(tmout);
        tmout = null;
    }
    if (tmout2 != null)
    {
        clearTimeout(tmout2);
        tmout2 = null;
    }
