class Loop {
    constructor() {
        this.id = null;
        this.callback = null;

        // loop method should be bind to this ...
        this.loop = this.loop.bind(this);
    }

    loop() {
        if (this.callback === null) return;
        this.callback();

        // ... otherwise, `this` will resolve to null here.
        // another option is to utilize lexical scoping like `() => { this.loop(); }`
        this.id = window.requestAnimationFrame(this.loop);
    }

    start(callback) {
        if (callback === false) return;
        this.callback = callback;
        this.loop();
    }

    stop() {
        if (this.id === null) return;
        window.cancelAnimationFrame(this.id);
        this.id = null;
        this.callback = null;
    }
}

export default Loop;
