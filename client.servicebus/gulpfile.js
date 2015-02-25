/// <vs BeforeBuild='jshint' AfterBuild='deploy, setStartup' />
var gulp = require('gulp');
var config = require('./gulpconfig');
var ssh2Client = require('ssh2').Client;
//var conn; //use in conjunction with execCallback if you need good ssh2 debug info


//set config defaults
var root;
config.startFile = config.startFile || 'app.js';
config.targetDevices.forEach(function (d) {
    d.sshPort = d.sshPort || 22;
    root = '/home/' + d.user + '/' + config.projectName;
});

// JS hint task
// this is just a nice library for making sure your JavaScript syntax is all good
gulp.task('jshint', function () {
    var jshint = require('gulp-jshint');
    gulp.src('./*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// deploy to the device
// NOTE: this will only deploy files at the root project level; it is not recursive
//TODO: consider converting to a ssh2 task to be consistent
gulp.task('deploy', function () {
    var scp = require('gulp-scp2');
    var g = gulp.src(['*.{js,json}', '!gulp*']);
    config.targetDevices.forEach(function (d) {
        console.log('Deploying to ' + d.devicename + '...');
        g.pipe(scp({
                host: d.hostname,
                username: d.user,
                password: d.password,
                dest: config.projectName
            }));
    })
    g.on('error', function (err) {
        console.log('ERR: ' + err);
    });
    return g;
});

//NOT WORKING
//run npm install on the remote machine to assure all packages
gulp.task('restorePackages', function () {
    config.targetDevices.forEach(function (d) {
        
        var conn = new ssh2Client();
        conn.on('ready', function () {
            var command = 'cd ' + root + '; ' +
                'npm install --production; ' + //restore node modules
                'cp -r /usr/lib/node_modules/mraa ' + root + '/node_modules; '; //we need the mraa library
            //console.log('Executing "' + command + '"');
            conn.exec(command, function (err, stream) { stream.on('close', function () { conn.end() }) });
        }).connect({ host: d.hostname, port: d.sshPort, username: d.user, password: d.password });
    });
});

//todo: consider killing arduino sketches

//create device config file task
gulp.task('createDeviceConfigFile', function () {
    config.targetDevices.forEach(function (d) {
        var configText =
            "module.exports = {" +
            "    deviceName: '" + d.devicename + "'" +
            "}";
        console.log(configText);
        var conn = new ssh2Client();
        conn.on('ready', function () {
            var command = 'echo "' + configText + '" > ' + root + '/config.js';
            console.log('Executing "' + command + '"');
            conn.exec(command, function (err, stream) { stream.on('close', function () { conn.end() }) });
        }).connect({ host: d.hostname, port: d.sshPort, username: d.user, password: d.password });
    });
});

//set startup
gulp.task('setStartup', function () {
    config.targetDevices.forEach(function (d) {
        console.log('Running setStartup task for ' + d.hostname);
        var serviceText =
 "[Unit]\n" + 
            "    Description = Node startup app service for starting a node process\n" +
            "    After = mdns.service\n" +
            "[Service]\n" +
            "    ExecStart = /usr/bin/node " + root + "/" + config.startFile + "\n" +
            "    Restart = on-failure\n" +
            "    RestartSec = 2s\n" +
            "[Install]\n" +
            "    WantedBy=default.target\n";
        
        var conn = new ssh2Client();
        conn.on('ready', function () {
            var command = 'systemctl stop nodeup.service; echo "' + serviceText + '" > /etc/systemd/system/nodeup.service; systemctl daemon-reload; systemctl enable nodeup.service; systemctl start nodeup.service';
            //console.log('Executing "' + command + '"');
            conn.exec(command, function (err, stream) { stream.on('close', function () { conn.end() }) });
        }).connect({ host: d.hostname, port: d.sshPort, username: d.user, password: d.password });
    });
});

//DON'T USE YET
////execute
//gulp.task('execute', ['killProcesses'], function () {
//    conn = new ssh2Client();
//    conn.on('ready', function () {
//        conn.exec("node " + root + "/" + config.startFile, execCallback);
//    }).connect({ host: config.host, port: config.sshPort, username: config.user, password: config.password });
//});

//kill processes (because the 'execute' task starts new ones)
//gulp.task('killProcesses', function () {
//    var conn = new ssh2Client();
//    conn.on('ready', function () {
//        var command = 'kill -9 `ps | grep "edref/app.js" | grep -v grep | awk \' { print $1 }\'`';
//        //console.log('Executing "' + command + '"');
//        conn.exec(command, execCallback);
//    }).connect({ host: config.host, port: config.sshPort, username: config.user, password: config.password });
//});

//use for ssh2 conn.exec callback if you need good ssh2 debug info
function execCallback(err, stream) {
    if (err) throw err;
    stream
        .on('close', function (code, signal) { console.log('Stream closed with code ' + code + ' and signal ' + signal); conn.end() })
        .on('data', function (data) { console.log(data); })
        .stderr.on('data', function (err) { console.log('Error: ' + err); });
}