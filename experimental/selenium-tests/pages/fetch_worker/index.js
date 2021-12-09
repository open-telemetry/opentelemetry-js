import '../helper';

const prepareClickEvent = () => {
  const element = document.getElementById('button1');

  const worker = new Worker('/fetch_worker.js');
  otel.worker = worker;
  const onClick = () => {
    worker.onmessage = ({ data }) => {
      switch (data.type) {
        case 'done': {
          // wait for OBSERVER_WAIT_TIME_MS
          setTimeout(() => {
            worker.postMessage({ type: 'get-finished-spans' });
          }, 500);
          break;
        }
        case 'finished-spans': {
          otel.finishedSpans = data.finishedSpans;
          otel.OTELSeleniumDone();
          console.log(otel.finishedSpans);
        }
      }
    }
    worker.postMessage({
      type: 'run',
    });
  };
  element.addEventListener('click', onClick);
};

window.addEventListener('load', prepareClickEvent);
