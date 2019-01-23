/**
 * Created by afilippov on 23.01.2019.
 */

function SuggestInput() {
    this.items_span = null;
    this.input = null;
    this.list_div = null;
    this.list_items = [];

    let that = this;

    this.onChange = function (event) {
        console.log(event.target.value);
        console.log(this);
        that.addListItem(event.target.value);
    }

    this.onItemDeletPressed = function(item)
    {

    }

    this.setTemplate = function (object) {
        this.items_span = document.createElement("span");
        this.input = document.createElement("input");
        this.list_div = document.createElement("div");

        this.input.addEventListener('input', this.onChange );

        object.appendChild(this.items_span);
        object.appendChild(this.input);
        object.appendChild(this.list_div);
    }

    this.addListItem = function (itemText) {
        let list_item = document.createElement('span');
        let list_delete_icon = document.createElement('span');

        list_item.innerHTML = itemText;
        list_item.appendChild(list_delete_icon);
        this.items_span.appendChild(list_item);
        this.list_items.push(list_item);
    }

    this.input_template = '<input class="suggest-input__input">' +
        '<div class="suggest-input__suggest_list"></div>';
    this.input_item_template = '<span class="suggest-input__items"></span>';

}

SuggestInput.InitInput = function (object) {
    si = new SuggestInput();
    si.setTemplate(object)
}


let suggest_inputs = document.getElementsByClassName('suggest-input');

for (let i = 0; i < suggest_inputs.length; i++)
{
    SuggestInput.InitInput(suggest_inputs[i]);

}

