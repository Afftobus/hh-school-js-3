
/* стек машин*/
const StateMachinenStack = [];

/* хочу более красиво дёргать вершину стека */
Object.defineProperty(StateMachinenStack, 'last', {
    enumerable: false,
    value: function () {
        return this[this.length - 1];
    }
});

/* описание машины */
const StateMachine = function (params) {
    /* притащим все параметры из конструктора */
    for (let key in params) {
        this[key] = params[key];
    }

    /* проверим есть ли там вобще состояния */
    if (typeof this.states !== 'object')
        throw new Error(`No states!`);

    /* проверим наличие и валидность исходного состояния */
    if (typeof this.initialState === 'undefined' || typeof this.states[this.initialState] === 'undefined')
        throw new Error(`Initial state not present in states!`);

    /* установим таки начальное состояние*/
    this.currentStateID = this.initialState;

    /* дёргаем екшены */
    this.tryToRunAction = function (action, eventData) {
        switch (typeof action) {
            case 'function':
                action(eventData);
                break;
            case 'string':
                if (typeof this.actions[action] === 'undefined')
                    throw new Error(`Action "${action}" not found`);
                this.actions[action](eventData);
                break;
            case 'object': // правильно я понял пункт ТЗ о том, что тут может быть массив?
                for (let key in action) {
                    this.tryToRunAction(action[key], eventData);
                }
                break;
        }
    };

    /* установим состояние */
    this.setState = (stateID, eventData) => {
        StateMachinenStack.push(this);

        if (typeof this.states[stateID] === 'undefined')
            throw new Error(`No state named "${stateID}" found in this machine!`);

        if (typeof this.states[this.currentStateID].onExit !== 'undefined') {
            this.tryToRunAction(this.states[this.currentStateID].onExit,eventData);
        }

        this.currentStateID = stateID;

        if (typeof this.states[this.currentStateID].onEntry !== 'undefined') {
            this.tryToRunAction(this.states[this.currentStateID].onEntry,eventData);
        }
        StateMachinenStack.pop();
    };

    /* получение текущего стейта */
    this.getState = () => {
        return this.currentStateID;
    };

    /* дополнение контекста */
    this.setContext = (newContextData) => {
        if (typeof this.context === 'undefined')
            this.context = newContextData;
        else
            this.context = Object.assign(this.context, newContextData);
    };

    /* получение контекста */
    this.getContext = () => {
        if (typeof this.context === 'undefined')
            return {};
        else
            return this.context
    };

    /* переход между состояниями */
    this.transition = (transitionName, eventData) => {
        StateMachinenStack.push(this);

        if (typeof this.states[this.currentStateID].on[transitionName] === 'undefined')
            throw new Error(`No transition named "${transitionName}" found in this machine!`);

        const currentTransition = this.states[this.currentStateID].on[transitionName];

        if (typeof currentTransition.service !== 'undefined')
            this.tryToRunAction(currentTransition.service,eventData);
            //currentTransition.service(eventData);

        else if (typeof currentTransition.target === 'string')
            this.setState(currentTransition.target, eventData);

        else
            throw new Error(`No correct service or target at transition "${transitionName}" found in this machine!`);

        StateMachinenStack.pop();
    };
};

function machine(params) {
    return new StateMachine(params);
}

const useContext = () => {
    let currentMachine = StateMachinenStack.last();
    return [currentMachine.getContext(), currentMachine.setContext];
};

const useState = () => {
    let currentMachine = StateMachinenStack.last();
    return [currentMachine.getState(), currentMachine.setState];
};

export {machine, useContext, useState}