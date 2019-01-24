
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
                action();
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
            this.tryToRunAction(this.states[this.currentStateID].onExit);
        }

        this.currentStateID = stateID;

        if (typeof this.states[this.currentStateID].onEntry !== 'undefined') {
            this.tryToRunAction(this.states[this.currentStateID].onEntry);
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

        if (typeof currentTransition.service === 'function')
            currentTransition.service(eventData);

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

//export {machine, useContext, useState}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Created by afilippov on 23.01.2019.
 */
//import ('./my-state-machine.js')

function SuggestInput() {
    this.items_span = null;
    this.input = null;
    this.list_div = null;
    this.list_items = [];

    let that = this;

    this.onChange = function (event) {
        console.log(event.target.value);
        console.log(this);
        that.addListItem(event.target.value); // TODO:
    };

    this.onItemDeletPressed = function(item)
    {

    };

    this.setTemplate = function (object) {
        this.items_span = document.createElement("span");
        this.input = document.createElement("input");
        this.list_div = document.createElement("div");

        this.input.addEventListener('input', this.onChange );

        object.appendChild(this.items_span);
        object.appendChild(this.input);
        object.appendChild(this.list_div);
    };

    this.addListItem = function (itemText) {
        let list_item = document.createElement('span');
        let list_delete_icon = document.createElement('span');

        list_item.innerHTML = itemText;
        list_item.appendChild(list_delete_icon);
        this.items_span.appendChild(list_item);
        this.list_items.push(list_item);
    };

    this.input_template = '<input class="suggest-input__input">' +
        '<div class="suggest-input__suggest_list"></div>';
    this.input_item_template = '<span class="suggest-input__items"></span>';

}

SuggestInput.InitInput = function (object) {
    si = new SuggestInput();
    si.setTemplate(object)
};


let suggest_inputs = document.getElementsByClassName('suggest-input');

for (let i = 0; i < suggest_inputs.length; i++)
{
    SuggestInput.InitInput(suggest_inputs[i]);

}

