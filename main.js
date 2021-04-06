function generateCoords(radius, pixelSize) {
  const coords = [];

  const lastCoords = {
    x: -1,
    y: -1,
  };

  for (let i = 270; i > 180; i--) {
    const x =
      parseInt(radius * Math.sin(i * 2 * (Math.PI / 360)) + radius + 0.5) *
      pixelSize;
    const y =
      parseInt(radius * Math.cos(i * 2 * (Math.PI / 360)) + radius + 0.5) *
      pixelSize;

    if (x !== lastCoords.x || y !== lastCoords.y) {
      lastCoords.x = x;
      lastCoords.y = y;

      coords.push({
        x,
        y,
      });
    }
  }

  return mirrorCoords(addCorners(mergeCoords(coords), pixelSize))
    .map((point) => {
      return `${point.x} ${point.y}`;
    })
    .join(",\n    ");
}

function mergeCoords(coords) {
  return coords.reduce((result, point, index) => {
    if (
      index !== coords.length - 1 &&
      point.x === 0 &&
      coords[index + 1].x === 0
    ) {
      return result;
    }

    if (index !== 0 && point.y === 0 && coords[index - 1].y === 0) {
      return result;
    }

    if (
      index !== 0 &&
      index !== coords.length - 1 &&
      point.x === coords[index - 1].x &&
      point.x === coords[index + 1].x
    ) {
      return result;
    }

    result.push(point);
    return result;
  }, []);
}

function addCorners(coords) {
  return coords.reduce((result, point, i) => {
    result.push(point);

    if (
      coords.length > 1 &&
      i < coords.length - 1 &&
      coords[i + 1].x !== point.x &&
      coords[i + 1].y !== point.y
    ) {
      result.push({
        x: coords[i + 1].x,
        y: point.y,
      });
    }

    return result;
  }, []);
}

function mirrorCoords(coords) {
  return [
    ...coords.map(({ x, y }) => ({ x: `${x}px`, y: `${y}px` })),
    ...coords.map(({ x, y }) => ({ x: edgeCoord(y), y: `${x}px` })),
    ...coords.map(({ x, y }) => ({
      x: edgeCoord(x),
      y: edgeCoord(y),
    })),
    ...coords.map(({ x, y }) => ({ x: `${y}px`, y: edgeCoord(x) })),
  ];
}

function edgeCoord(n) {
  return n === 0 ? "100%" : `calc(100% - ${n}px)`;
}

function showResult(e) {
  e.preventDefault();
  const radius = parseInt(document.querySelector(".radius").value, 10);
  const pixelSize = parseInt(document.querySelector(".pixel_size").value, 10);

  const path = generateCoords(radius, pixelSize);
  document.documentElement.style.setProperty("--path", path);

  document.querySelector(".value-pane__result").value = `.pixel-corners {
  clip-path: polygon(
    ${path}
  );
}`;
  document.querySelector(".pane-wrapper").style.padding = `${
    radius * (pixelSize / 4)
  }px`;
}

function copy(e) {
  const fakeElem = document.createElement("textarea");
  fakeElem.style.fontSize = "0px";
  fakeElem.style.border = "0";
  fakeElem.style.padding = "0";
  fakeElem.style.margin = "0";
  fakeElem.style.position = "absolute";
  fakeElem.style.left = "-9999px"; // Move element to the same position vertically
  fakeElem.style.top = "0px";
  fakeElem.setAttribute("readonly", "");
  fakeElem.value = document.querySelector(".value-pane__result").value;
  document.body.appendChild(fakeElem);
  fakeElem.select();
  document.execCommand("copy");
  document.body.removeChild(fakeElem);
  e.target.innerHTML = "Copied!";
  setTimeout(() => {
    e.target.innerHTML = "Copy";
  }, 2000);
}

document.querySelector(".value-pane__copy").addEventListener("click", copy);

document.querySelector(".value-form").addEventListener("submit", showResult);
window.addEventListener("load", showResult);
