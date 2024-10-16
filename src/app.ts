namespace Graph {
  export type Node = {
    x: number;
    y: number;
  };

  export type Worker = {
    id: string;
    location: Node;
    speed: number;
  };

  export type Task = {
    id: string;
    location: Node;
    loss: number;
  };

  export type Route = {
    workerId: string;
    tasks: Array<Task>;
  };

  export type Solution = {
    id: string;
    routes: Array<Route>;
  };
}

/**
 * Distance from A - B in units.
 *
 * @param a
 * @param b
 * @returns
 */
const distance = (a: Graph.Node, b: Graph.Node): number => {
  const dx2 = Math.pow(Math.abs(b.x - a.x), 2);
  const dy2 = Math.pow(Math.abs(b.y - a.y), 2);
  return Math.sqrt(dx2 + dy2);
};

/**
 * Loss over the route expressed in minutes.
 *
 * @param worker
 * @param route
 * @returns
 */
const loss = (worker: Graph.Worker, route: Graph.Route): number => {
  let loss = 0;
  let curr = worker.location;

  route.tasks.forEach((t) => {
    loss += distance(curr, t.location) / worker.speed + t.loss;
    curr = t.location;
  });

  return loss;
};

/**
 * Compute the longest route for a solution expressed in minutes.
 *
 * @param workers
 * @param solution
 * @returns
 */
const longestRoute = (
  workers: Array<Graph.Worker>,
  solution: Graph.Solution
): number => {
  const longest = solution.routes.sort(
    (a, b) =>
      loss(workers.find((w) => w.id === b.workerId)!, b) -
      loss(workers.find((w) => w.id === a.workerId)!, a)
  )?.[0];
  const time = loss(workers.find((w) => w.id === longest.workerId)!, longest);
  return time;
};

const permutations = <T>(xs: Array<T>): Array<Array<T>> => {
  const ret: Array<Array<T>> = [];

  for (let i = 0; i < xs.length; i = i + 1) {
    const rest = permutations(xs.slice(0, i).concat(xs.slice(i + 1)));

    if (!rest.length) {
      ret.push([xs[i]]);
    } else {
      for (let j = 0; j < rest.length; j = j + 1) {
        ret.push([xs[i]].concat(rest[j]));
      }
    }
  }

  return ret;
};

/**
 * Solve for lowest overall service time in minutes.
 *
 * @param workers
 * @param tasks
 * @param config
 * @returns
 */
const solve = (
  workers: Array<Graph.Worker>,
  tasks: Array<Graph.Task>
  //   config: Config
): Graph.Solution => {
  const workerCopy = [...workers];
  const tasksCopy = [...tasks];

  let s: Graph.Solution = {
    id: "",
    routes: [],
  };

  const getWorkerTasks = (id: string): Array<Graph.Task> => {
    return s.routes.find((r) => r.workerId === id)?.tasks ?? [];
  };

  const getRouteWithTask = (id: string, task: Graph.Task): Graph.Route => {
    return { workerId: id, tasks: [...getWorkerTasks(id), task] };
  };

  const addTaskToRoute = (id: string, task: Graph.Task): void => {
    s = {
      id: "",
      routes: [
        ...s.routes.filter((r) => r.workerId !== id),
        getRouteWithTask(id, task),
      ],
    };
  };

  for (let i = 0; i < tasksCopy.length; i++) {
    let bestLoss = Number.MAX_VALUE;
    let wid: number | null = null;

    for (let j = 0; j < workerCopy.length; j++) {
      const thisLoss = loss(
        workerCopy[j],
        getRouteWithTask(workerCopy[j].id, tasksCopy[i])
      );

      if (thisLoss < bestLoss) {
        wid = j;
        bestLoss = thisLoss;
      }
    }

    if (wid !== null) {
      addTaskToRoute(workerCopy[wid].id, tasksCopy[i]);
    }
  }

  return { ...s, id: crypto.randomUUID() };
};

const uniqBy = (arr, predicate) => {
  const cb = typeof predicate === 'function' ? predicate : (o) => o[predicate];

  return [...arr.reduce((map, item) => {
    const key = (item === null || item === undefined) ?
      item : cb(item);

    map.has(key) || map.set(key, item);

    return map;
  }, new Map()).values()];
};

const start = () => {
  let mode: "worker" | "task" = "task";
  const $modeSelect = document.querySelector("#mode");
  const $map = document.querySelector("#map");
  const $solveButton = document.querySelector("#solve");
  const $solutionList = document.querySelector('#solutions');
  let sortedSolutions: Array<Graph.Solution> = [];

  const addTask = (node: Graph.Task) => {
    const tasks = getTasks()
    if (tasks.length >= 7) return
    const $node = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    $node.setAttribute("data-id", node.id);
    $node.setAttribute("data-x", `${node.location.x}`);
    $node.setAttribute("data-y", `${node.location.y}`);
    $node.setAttribute("cx", `${node.location.x}`);
    $node.setAttribute("cy", `${node.location.y}`);
    $node.setAttribute("r", "3");
    $node.setAttribute("fill", "blue");
    $node.classList.add("task");
    $map?.appendChild($node);
  };

  const addWorker = (node: Graph.Worker) => {
    const workers = getWorkers()
    if (workers.length >= 3) return
    const $node = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    $node.setAttribute("data-id", node.id);
    $node.setAttribute("data-x", `${node.location.x}`);
    $node.setAttribute("data-y", `${node.location.y}`);
    $node.setAttribute("cx", `${node.location.x}`);
    $node.setAttribute("cy", `${node.location.y}`);
    $node.setAttribute("r", "3");
    if (workers.length === 0) {
      $node.setAttribute("fill", "yellow");
    }
    if (workers.length === 1) {
      $node.setAttribute("fill", "green");
    }
    if (workers.length === 2) {
      $node.setAttribute("fill", "orange");
    }
    $node.classList.add("worker");
    $map?.appendChild($node);
  };

  const addRoute = (route: Graph.Route) => {
    const $workers = Array.from(
      $map?.querySelectorAll(".worker") ?? []
    )
    const workers: Array<Graph.Worker> = getWorkers();

    const $node = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    const worker = workers.find((w) => w.id === route.workerId)!;
    const $worker = $workers.find(($w) => $w.getAttribute('data-id') === route.workerId)
    $node.setAttribute(
      "d",
      `M ${worker.location.x} ${worker.location.y} ${route.tasks
        .map((t) => `L ${t.location.x} ${t.location.y}`)
        .join(" ")}`
    );
    $node.setAttribute("fill", "transparent");
    $node.setAttribute("stroke", $worker?.getAttribute('fill') ?? 'white');
    $node.setAttribute("stroke-width", "1");
    $map?.prepend($node);
  };

  const getWorkers = () => {
    return Array.from(
      $map?.querySelectorAll(".worker") ?? []
    ).map((w) => ({
      id: w.getAttribute("data-id") ?? "",
      location: {
        x: parseInt(w.getAttribute("data-x") ?? ""),
        y: parseInt(w.getAttribute("data-y") ?? ""),
      },
      speed: 5,
    }));
  }

  const getTasks = () => {
    return Array.from(
      $map?.querySelectorAll(".task") ?? []
    ).map((t) => ({
      id: t.getAttribute("data-id") ?? "",
      location: {
        x: parseInt(t.getAttribute("data-x") ?? ""),
        y: parseInt(t.getAttribute("data-y") ?? ""),
      },
      loss: 1,
    }));
  }

  const removeAllRoutes = () => {
    $map?.querySelectorAll("path").forEach((c) => {
      $map.removeChild(c);
    });
  };

  const renderSolution = (s: Graph.Solution) => {
    removeAllRoutes();
    s.routes.forEach((r) => {
      addRoute(r);
    });
  };

  const renderSolutionList = () => {
    document.querySelectorAll('.solution-button').forEach((b) => b.remove())
    const $elements: Array<Node> = []
    const workers = getWorkers();
    [0, Math.floor(sortedSolutions.length / 2), sortedSolutions.length - 1].forEach((i) => {
      const s = sortedSolutions[i]
      const $element = document.createElement('li')
      $element.innerText = `(${longestRoute(workers, s).toFixed(1)} min.) ${s.id.slice(0, 8)}..`
      $element.setAttribute('data-idx', `${i}`)
      $element.classList.add('solution-button')
      $element.addEventListener('click', () => {
        renderSolution(sortedSolutions[i])
      })
      $elements.push($element)
    })
    $solutionList?.append(...$elements)
  }

  $map?.addEventListener("click", (e: any) => {
    const x = e.layerX;
    const y = e.layerY;
    const id = crypto.randomUUID();

    if (mode === "task") {
      addTask({ id, location: { x, y }, loss: 1 });
    } else {
      addWorker({ id, location: { x, y }, speed: 5 });
    }
  });

  $modeSelect?.addEventListener("change", (e: any) => {
    mode = e.target.value;
  });

  $solveButton?.addEventListener("click", (e: any) => {
    const workers = getWorkers()
    const tasks = getTasks()
    const pw = permutations(workers);
    const pt = permutations(tasks);

    const allSolutions: Array<Graph.Solution> = [];
    for (let i = 0; i < pw.length; i++) {
      for (let j = 0; j < pt.length; j++) {
        allSolutions.push(solve(pw[i], pt[j]));
      }
    }
    sortedSolutions = uniqBy(allSolutions.sort(
      (a, b) => longestRoute(workers, a) - longestRoute(workers, b)
    ), (s) => longestRoute(workers, s));
    renderSolution(sortedSolutions?.[0]);
    renderSolutionList();
  });
};

addEventListener("DOMContentLoaded", () => {
  start();
});
