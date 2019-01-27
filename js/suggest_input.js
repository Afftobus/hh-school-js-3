import {areaMachine} from './get-area-machine.js';

function SuggestInput(machine) {
    // храню ссылки на все эти элементы просто потому что так удобнее
    this.object = null;
    this.items_span = null;
    this.input = null;
    this.list_div = null;
    this.list_items = [];

    this.machine = machine;
    this.timer = null;

    machine.transition('init', {target: this});

    let that = this;

    this.onChange = function (event) {
        // не хочу дёргать удалённый сервак на каждом нажатии, жду полсекунды
        clearTimeout(that.timer);
        that.timer =setTimeout(()=>{that.machine.transition('input', {text: event.target.value});}, 500);
    };

    this.onItemDeletePressed = function(itemID)
    {
        console.log("onItemDeletePressed");
        console.log(itemID);

        //removeitem
        that.machine.transition('removeitem', itemID);
    };

    this.confirmItem = function(event)
    {
        console.log("updateSelectedItems");
        console.log(event.target);

        let item = {};
        item.id = event.target.getAttribute("data-id");
        item.url = event.target.getAttribute("data-url");
        item.text = event.target.innerHTML;

        that.machine.transition('confirm', {item: item});
    };

    this.updateSelectedItems = function (items) {
        console.log("updateSelectedItems");
        console.log(items);

        that.items_span.innerHTML = '';
        for (let i = 0; i < items.length; i++)
        {
            let just_one_item = document.createElement("span");
            just_one_item.classList.add("suggest-input__selected-items__item");
            just_one_item.innerHTML = items[i].text;
            just_one_item.setAttribute("data-id",items[i].id);
            just_one_item.setAttribute("data-url",items[i].url);

            let close_button = document.createElement("span");
            close_button.classList.add("suggest-input__selected-items__delete-button");
            close_button.innerHTML = 'x';
            close_button.addEventListener("click",()=>{that.onItemDeletePressed(items[i].id)});

            just_one_item.appendChild(close_button);
            that.items_span.appendChild(just_one_item);
        }
    };

    this.setStandbyMode = function () {
        console.log("setStandbyMode");
        if (that.list_div !== null)
            that.object.removeChild( that.list_div);

        that.input.value = '';
    };

    this.setErrorMode = function () {
        console.log("setErrorMode");
    };

    this.unsetErrorMode = function () {
        console.log("unsetErrorMode");
    };

    this.setWaitMode = function () {
        console.log("setWaitMode");
        that.input.disabled = true;
    };

    this.unsetWaitMode = function () {
        console.log("unsetWaitMode");
        that.input.disabled = false;
        that.input.focus();
    };

    this.showSuggests = function (items) {
        console.log("showSuggests");
        console.log(items);

        if (that.list_div === null)
            that.list_div = document.createElement("div");
        else
            that.list_div.innerHTML = '';

        that.list_div.classList.add("suggest-input__suggest-list");

        for (let i=0; i< items.length; i++)
        {
            let just_one_item = document.createElement("div");
            just_one_item.classList.add("suggest-input__suggest-list-item");

            just_one_item.innerHTML = items[i].text;
            just_one_item.setAttribute("data-id",items[i].id);
            just_one_item.setAttribute("data-url",items[i].url);
            just_one_item.addEventListener('click', that.confirmItem );
            that.list_div.appendChild(just_one_item);
        }
        if (!that.object.contains(that.list_div))
            that.object.appendChild(that.list_div);

    };

    this.setTemplate = function (object) {
        this.object = object;

        this.items_span = document.createElement("span");
        this.input = document.createElement("input");

        this.input.classList.add("suggest-input__input");
        this.items_span.classList.add("suggest-input__selected-items");

        this.input.addEventListener('input', this.onChange );

        object.appendChild(this.input);
        object.appendChild(this.items_span);
    };

    this.addListItem = function (itemText) {
        let list_item = document.createElement('span');
        let list_delete_icon = document.createElement('span');

        list_item.innerHTML = itemText;
        list_item.appendChild(list_delete_icon);
        this.items_span.appendChild(list_item);
        this.list_items.push(list_item);
    };

    // this.input_template = '<input class="suggest-input__input">' +
    //     '<div class="suggest-input__suggest_list"></div>';
    // this.input_item_template = '<span class="suggest-input__items"></span>';
}

SuggestInput.InitInput = function (object) {
    let si = new SuggestInput(areaMachine);
    si.setTemplate(object);
};


let suggest_inputs = document.getElementsByClassName('suggest-input');

for (let i = 0; i < suggest_inputs.length; i++)
{
    SuggestInput.InitInput(suggest_inputs[i]);

}

