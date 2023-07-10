class Events {
    events = {};

    static instance = null;

    static getInstance() {
        if (!Events.instance) {
            Events.instance = new Events();
        }
        return Events.instance;
    }

    on (name, handle, context?, isOne = false ) {
        let handles = this.events[name] || [];
        if (handles.length) {
            this.events[name].push({handle, context, isOne})
        } else {
            this.events[name] = [{handle, context, isOne}];
        }
    }

    once (name, handle?, context?) {
        this.on(name, handle, context, true);
    }

    off (name, handle?, context?) {
        if (!handle) {
            if (this.events[name]) this.events[name] = [];
        } else {
            let handles = this.events[name] || [];
            if (handles.length) {
                if (context) {
                    this.events[name] = handles.filter(h => h.handle === handle && h.context === context);
                } else {
                    this.events[name] = handles.filter(h => h.handle === handle);
                }
            }
        }
    }

    emit (name, ...args) {
        let handles = this.events[name] || [];
        if (handles.length) {
            handles.forEach((event) => {
                let {handle, context, isOne} = event;
                handle.apply(context, args);
                if (isOne) this.off(name, handle, context);
            });
        }
    }
}

export default Events;