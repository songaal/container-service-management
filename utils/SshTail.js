const EventEmitter = require('events').EventEmitter
const util = require('util')
const ssh2 = require('ssh2')

let SshTail = function(sshOpts) {

    this.connection = null;
    this.stream = null;
    this.state = 'disconnected';

    this.sshOpts = sshOpts || {};
};
util.inherits(SshTail, EventEmitter);

SshTail.prototype.status = function(status, emit){

    if (status === undefined ) return this.state;
    emit = (emit === undefined) ? true : emit;
    this.state = status;
    if (emit) this.emit(status);
};

SshTail.prototype.start = function(logFiles){

    let self = this;

    if (this.connection !== null) {
        this.emit('error', new Error('Unable to tail, already connected. Please disconnect first'));
        return this;
    }

    this.connection = new ssh2();

    this.connection.on('ready', function() {

        self.status('connected');

        let cmd = ""
        if (self.sshOpts['mode']||'' === "docker") {
            if (Array.isArray(logFiles)) {
                logFiles = logFiles.join('|');
            }
            cmd = 'docker ps -q|grep -E "' + logFiles + '" | xargs -L 1 -P `docker ps | wc -l` docker logs --tail 0 -f & read; kill $!'
        } else {
            if (Array.isArray(logFiles)) {
                logFiles = logFiles.join(' ');
            }
            cmd = 'tail -f ' + logFiles + ' & read; kill $!'
        }
        console.log(cmd)
        self.connection.exec(cmd, function(err, stream) {

            if (err) return self.emit('error', err);

            self.status('tailing');

            self.stream = stream;

            self.stream

                .on('exit', function(code, signal) {
                    self.status('eof', false);
                    self.emit('eof', code, signal);
                })

                .on('close', function() {
                    self.status('disconnected');
                    self.connection.end();
                    self.connection = null;
                    this.stream = null;
                })

                .on('data', function(data) {
                    self.emit('stdout', data);
                })

                .stderr.on('data', function(data) {
                self.emit('stderr', data);
            });
        });

    });

    this.connection.on('error', function(err){
        self.emit('error', err);
    });
    this.connection.connect(this.sshOpts);

    return this;
}

SshTail.prototype.stop = function(){

    if (this.connection === null) {
        this.emit('error', new Error('Unable to stop, not connected.'));
        return this;
    }
    if (this.stream === null) {
        this.emit('error', new Error('Unable to stop, no stream'));
        return this;
    }

    this.stream.write('\n');
    return this;
}

module.exports = SshTail