import { h, app } from './hyperapp.js';

const effect = async (dispatch, cmd) => {
  if (cmd) {
    dispatch(state => ({ ...state, executing: true }));
    await glu(cmd, ([stdout, stderr]) => {
      const out = stdout || stderr;
      dispatch(state => ({
        ...state,
        stdio: [
          ...state.stdio,
          `→ ${state.pwd.split('/').pop()}: ${cmd}`,
          ...out.split('\n')
        ],
        input: '',
        history: [...state.history, cmd]
      }));
    });
    dispatch(state => ({ ...state, executing: false }));
  }
};

const run = (state, e) => {
  e.preventDefault();
  return [state, [effect, e.target.elements[0].value]];
};

const pwd = dispatch => {
  glu('pwd').then(pwd => {
    dispatch(state => ({ ...state, pwd }));
  });
};

const setInput = (state, e) => {
  return { ...state, input: e.target.value };
};

const scroll = state => {
  setTimeout(() => window.scrollTo(0, 1000000), 0);
};

app({
  init: [
    {
      stdio: [],
      history: [],
      pwd: '',
      input: ''
    },
    [pwd]
  ],
  subscriptions: state => [scroll(state)],
  view: state =>
    console.log(state) ||
    h('main', {}, [
      h(
        'div',
        {},
        state.stdio.map(x => h('p', {}, x))
      ),
      h(
        'form',
        {
          onSubmit: run,
          style: { opacity: state.executing ? '0' : '1' }
        },
        [
          h('label', {}, '→ ' + state.pwd.split('/').pop() + ':'),
          h('input', {
            key: 'input',
            autofocus: true,
            value: state.input,
            oninput: setInput
          })
        ]
      )
    ]),
  node: document.body
});
