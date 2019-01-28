import {machine, useContext, useState} from './my-state-machine.js';
import {Suggest} from './get-suggest.js'

const areaMachine = new machine({
    id: 'areaMachine',
    initialState: 'standby',
    context: {
        items: [],
        selected_items: [],
        target: null,// обратная связь, из машины в контроллер инпута.
        error: null,
        timer: null
    },
    // Граф состояний и переходов между ними
    states: {

        // Основное состояние, когда мы что-то ждём от пользователя
        standby: {
            onEntry: () => {
                console.log("standby entered");
                const [context, setContext] = useContext();
                if (typeof context.target !== 'undefined' &&
                    context.target !== null &&
                    typeof context.target.setStandbyMode === 'function') {
                    context.target.setStandbyMode();
                }
            },
            on: {
                init: {
                    service: (event) => {
                        const [context, setContext] = useContext();
                        setContext({target: event.target});
                        //console.log(event);
                    }
                },
                input: {
                    service: 'inputAction'
                },
                removeitem:{
                    service: (item_id) =>{
                        const [context, setContext] = useContext();

                        const items = context.selected_items.filter(item=>item.id !== item_id);
                        setContext({selected_items: items});
                        if (typeof context.target.updateSelectedItems === "function")
                            context.target.updateSelectedItems(context.selected_items);
                    }
                }
            }
        },

        // здесь мы будем показывать прелоадер -------------------------------------------------------------------------
        wait: {
            onEntry() {
                console.log("wait entered");
                const [context, setContext] = useContext();
                const [state, setState] = useState();
                if (typeof context.target.setWaitMode === 'function')
                    context.target.setWaitMode();

                context.timer = setTimeout(
                    ()=>{
                        setContext({items: null});
                        setContext({error: "сервер не отвечает 10 сек, что-то пошло нетак"});
                        setState('error');
                    }, 1);
            },
            onExit() {
                const [context, setContext] = useContext();
                clearTimeout(context.timer);
                if (typeof context.target.unsetWaitMode === 'function')
                    context.target.unsetWaitMode();

                console.log("wait exiting");
            },
            on: {
                input: {
                    service: () => {
                        console.log("please wait, request pending");

                    }
                }
            }
        },

        // что-то пошло нетак, нужно сказать об этом пользователю
        error: {
            onEntry() {
                console.log("error entered");
                const [context, setContext] = useContext();
                if (typeof context.target.setErrorMode === 'function')
                    context.target.setErrorMode(context.error);
            },
            onExit() {
                console.log("error exiting");
                const [context, setContext] = useContext();
                if (typeof context.target.unsetErrorMode === 'function')
                    context.target.unsetErrorMode();
            },
            on: {
                input: {
                    service: 'inputAction'
                },
                confirm:{
                    target: 'standby'
                }
            }
        },

        // показываем варианты
        suggest: {
            onEntry() {
                const [context, setContext] = useContext();
                if (typeof context.target.showSuggests === "function")
                    context.target.showSuggests(context.items);
                console.log("suggest entered");
                //console.log(context.items);
            },
            on: {
                input: {
                    service: 'inputAction'
                },
                confirm: {
                    service: (event) => {
                        if (typeof event.item !== "undefined") {
                            const [context, setContext] = useContext();
                            context.selected_items.push(event.item );
                            context.target.updateSelectedItems(context.selected_items);
                        }
                        const [state, setState] = useState();
                        setState('standby');
                    }
                }
            }
        },
        responded: {
            // action, который нужно выполнить при входе в это состояние. Можно задавать массивом, строкой или функцией
            onEntry: ['onStateEntry', () => {
                console.log("it`s work")
            }]
        },
        notResponded: {
            // action, который нужно выполнить при выходе из этого состояния. Можно задавать массивом, строкой или функцией
            onExit() {
                console.log('we are leaving notResponded state');
            },
            // Блок описания транзакций
            on: {
                // Транзакция
                RESPOND: {
                    // упрощенный сервис, вызываем при транзакции
                    service: (event) => {
                        // Позволяет получить текущий контекст и изменить его
                        const [context, setContext] = useContext();
                        // Позволяет получить текущий стейт и изменить его
                        const [state, setState] = useState();
                        // Поддерживаются асинхронные действия
                        window.fetch({method: 'post', data: {resume: event.resume, vacancyId: context.id}}).then(() => {
                            // меняем состояние
                            setState('responded');
                            // Мержим контекст
                            setContext({completed: true}); // {id: 123, comleted: true}
                        });
                    },
                    // Если не задан сервис, то просто переводим в заданный target, иначе выполняем сервис.
                    target: 'responded',
                }
            }
        },
    },
    // Раздел описание экшенов
    actions: {
        inputAction: (event) => {
            console.log("enter input ACTION");
            console.log(event);

            const [context, setContext] = useContext();
            const [state, setState] = useState();

            // в любой непонятной ситуации возвращаемся в standby

            if (typeof event.text !== "string" || !event.text.length) {
                setState('standby');
                return;
            }

            // при попытке получить подсказки по менее чем 2м символам всё равно вернётся ошибка
            if (event.text.length < 3) {
                return;
            }

            // норм текст? пуляем запрос
            setState('wait');
            Suggest.getAreas(event.text,
                (response) => {
                    setContext({items: response});
                    setContext({error: null});
                    setState('suggest');
                },
                (error) => {
                    setContext({items: null});
                    setContext({error: error});
                    setState('error');
                });
        }
    }
});

export {areaMachine}
