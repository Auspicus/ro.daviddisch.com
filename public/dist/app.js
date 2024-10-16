const distance = (a, b)=>{
    const dx2 = Math.pow(Math.abs(b.x - a.x), 2);
    const dy2 = Math.pow(Math.abs(b.y - a.y), 2);
    return Math.sqrt(dx2 + dy2);
};
const loss = (worker, route)=>{
    let loss = 0;
    let curr = worker.location;
    route.tasks.forEach((t)=>{
        loss += distance(curr, t.location) / worker.speed + t.loss;
        curr = t.location;
    });
    return loss;
};
const longestRoute = (workers, solution)=>{
    var _solution_routes_sort;
    const longest = (_solution_routes_sort = solution.routes.sort((a, b)=>loss(workers.find((w)=>w.id === b.workerId), b) - loss(workers.find((w)=>w.id === a.workerId), a))) === null || _solution_routes_sort === void 0 ? void 0 : _solution_routes_sort[0];
    const time = loss(workers.find((w)=>w.id === longest.workerId), longest);
    return time;
};
const permutations = (xs)=>{
    const ret = [];
    for(let i = 0; i < xs.length; i = i + 1){
        const rest = permutations(xs.slice(0, i).concat(xs.slice(i + 1)));
        if (!rest.length) ret.push([
            xs[i]
        ]);
        else for(let j = 0; j < rest.length; j = j + 1)ret.push([
            xs[i]
        ].concat(rest[j]));
    }
    return ret;
};
const solve = (workers, tasks)=>{
    const workerCopy = [
        ...workers
    ];
    const tasksCopy = [
        ...tasks
    ];
    let s = {
        id: "",
        routes: []
    };
    const getWorkerTasks = (id)=>{
        var _s_routes_find;
        var _s_routes_find_tasks;
        return (_s_routes_find_tasks = (_s_routes_find = s.routes.find((r)=>r.workerId === id)) === null || _s_routes_find === void 0 ? void 0 : _s_routes_find.tasks) !== null && _s_routes_find_tasks !== void 0 ? _s_routes_find_tasks : [];
    };
    const getRouteWithTask = (id, task)=>{
        return {
            workerId: id,
            tasks: [
                ...getWorkerTasks(id),
                task
            ]
        };
    };
    const addTaskToRoute = (id, task)=>{
        s = {
            id: "",
            routes: [
                ...s.routes.filter((r)=>r.workerId !== id),
                getRouteWithTask(id, task)
            ]
        };
    };
    for(let i = 0; i < tasksCopy.length; i++){
        let bestLoss = Number.MAX_VALUE;
        let wid = null;
        for(let j = 0; j < workerCopy.length; j++){
            const thisLoss = loss(workerCopy[j], getRouteWithTask(workerCopy[j].id, tasksCopy[i]));
            if (thisLoss < bestLoss) {
                wid = j;
                bestLoss = thisLoss;
            }
        }
        if (wid !== null) addTaskToRoute(workerCopy[wid].id, tasksCopy[i]);
    }
    return {
        ...s,
        id: crypto.randomUUID()
    };
};
const uniqBy = (arr, predicate)=>{
    const cb = typeof predicate === 'function' ? predicate : (o)=>o[predicate];
    return [
        ...arr.reduce((map, item)=>{
            const key = item === null || item === undefined ? item : cb(item);
            map.has(key) || map.set(key, item);
            return map;
        }, new Map()).values()
    ];
};
const start = ()=>{
    let mode = "task";
    const $modeSelect = document.querySelector("#mode");
    const $map = document.querySelector("#map");
    const $solveButton = document.querySelector("#solve");
    const $solutionList = document.querySelector('#solutions');
    let sortedSolutions = [];
    const addTask = (node)=>{
        const tasks = getTasks();
        if (tasks.length >= 7) return;
        const $node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        $node.setAttribute("data-id", node.id);
        $node.setAttribute("data-x", `${node.location.x}`);
        $node.setAttribute("data-y", `${node.location.y}`);
        $node.setAttribute("cx", `${node.location.x}`);
        $node.setAttribute("cy", `${node.location.y}`);
        $node.setAttribute("r", "3");
        $node.setAttribute("fill", "blue");
        $node.classList.add("task");
        $map === null || $map === void 0 ? void 0 : $map.appendChild($node);
    };
    const addWorker = (node)=>{
        const workers = getWorkers();
        if (workers.length >= 3) return;
        const $node = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        $node.setAttribute("data-id", node.id);
        $node.setAttribute("data-x", `${node.location.x}`);
        $node.setAttribute("data-y", `${node.location.y}`);
        $node.setAttribute("cx", `${node.location.x}`);
        $node.setAttribute("cy", `${node.location.y}`);
        $node.setAttribute("r", "3");
        if (workers.length === 0) $node.setAttribute("fill", "yellow");
        if (workers.length === 1) $node.setAttribute("fill", "green");
        if (workers.length === 2) $node.setAttribute("fill", "orange");
        $node.classList.add("worker");
        $map === null || $map === void 0 ? void 0 : $map.appendChild($node);
    };
    const addRoute = (route)=>{
        var _$map_querySelectorAll;
        const $workers = Array.from((_$map_querySelectorAll = $map === null || $map === void 0 ? void 0 : $map.querySelectorAll(".worker")) !== null && _$map_querySelectorAll !== void 0 ? _$map_querySelectorAll : []);
        const workers = getWorkers();
        const $node = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const worker = workers.find((w)=>w.id === route.workerId);
        const $worker = $workers.find(($w)=>$w.getAttribute('data-id') === route.workerId);
        $node.setAttribute("d", `M ${worker.location.x} ${worker.location.y} ${route.tasks.map((t)=>`L ${t.location.x} ${t.location.y}`).join(" ")}`);
        $node.setAttribute("fill", "transparent");
        var _$worker_getAttribute;
        $node.setAttribute("stroke", (_$worker_getAttribute = $worker === null || $worker === void 0 ? void 0 : $worker.getAttribute('fill')) !== null && _$worker_getAttribute !== void 0 ? _$worker_getAttribute : 'white');
        $node.setAttribute("stroke-width", "1");
        $map === null || $map === void 0 ? void 0 : $map.prepend($node);
    };
    const getWorkers = ()=>{
        var _$map_querySelectorAll;
        return Array.from((_$map_querySelectorAll = $map === null || $map === void 0 ? void 0 : $map.querySelectorAll(".worker")) !== null && _$map_querySelectorAll !== void 0 ? _$map_querySelectorAll : []).map((w)=>{
            var _w_getAttribute, _w_getAttribute1, _w_getAttribute2;
            return {
                id: (_w_getAttribute = w.getAttribute("data-id")) !== null && _w_getAttribute !== void 0 ? _w_getAttribute : "",
                location: {
                    x: parseInt((_w_getAttribute1 = w.getAttribute("data-x")) !== null && _w_getAttribute1 !== void 0 ? _w_getAttribute1 : ""),
                    y: parseInt((_w_getAttribute2 = w.getAttribute("data-y")) !== null && _w_getAttribute2 !== void 0 ? _w_getAttribute2 : "")
                },
                speed: 5
            };
        });
    };
    const getTasks = ()=>{
        var _$map_querySelectorAll;
        return Array.from((_$map_querySelectorAll = $map === null || $map === void 0 ? void 0 : $map.querySelectorAll(".task")) !== null && _$map_querySelectorAll !== void 0 ? _$map_querySelectorAll : []).map((t)=>{
            var _t_getAttribute, _t_getAttribute1, _t_getAttribute2;
            return {
                id: (_t_getAttribute = t.getAttribute("data-id")) !== null && _t_getAttribute !== void 0 ? _t_getAttribute : "",
                location: {
                    x: parseInt((_t_getAttribute1 = t.getAttribute("data-x")) !== null && _t_getAttribute1 !== void 0 ? _t_getAttribute1 : ""),
                    y: parseInt((_t_getAttribute2 = t.getAttribute("data-y")) !== null && _t_getAttribute2 !== void 0 ? _t_getAttribute2 : "")
                },
                loss: 1
            };
        });
    };
    const removeAllRoutes = ()=>{
        $map === null || $map === void 0 ? void 0 : $map.querySelectorAll("path").forEach((c)=>{
            $map.removeChild(c);
        });
    };
    const renderSolution = (s)=>{
        removeAllRoutes();
        s.routes.forEach((r)=>{
            addRoute(r);
        });
    };
    const renderSolutionList = ()=>{
        document.querySelectorAll('.solution-button').forEach((b)=>b.remove());
        const $elements = [];
        const workers = getWorkers();
        [
            0,
            Math.floor(sortedSolutions.length / 2),
            sortedSolutions.length - 1
        ].forEach((i)=>{
            const s = sortedSolutions[i];
            const $element = document.createElement('li');
            $element.innerText = `(${longestRoute(workers, s).toFixed(1)} min.) ${s.id.slice(0, 8)}..`;
            $element.setAttribute('data-idx', `${i}`);
            $element.classList.add('solution-button');
            $element.addEventListener('click', ()=>{
                renderSolution(sortedSolutions[i]);
            });
            $elements.push($element);
        });
        $solutionList === null || $solutionList === void 0 ? void 0 : $solutionList.append(...$elements);
    };
    $map === null || $map === void 0 ? void 0 : $map.addEventListener("click", (e)=>{
        const x = e.layerX;
        const y = e.layerY;
        const id = crypto.randomUUID();
        if (mode === "task") addTask({
            id,
            location: {
                x,
                y
            },
            loss: 1
        });
        else addWorker({
            id,
            location: {
                x,
                y
            },
            speed: 5
        });
    });
    $modeSelect === null || $modeSelect === void 0 ? void 0 : $modeSelect.addEventListener("change", (e)=>{
        mode = e.target.value;
    });
    $solveButton === null || $solveButton === void 0 ? void 0 : $solveButton.addEventListener("click", (e)=>{
        const workers = getWorkers();
        const tasks = getTasks();
        const pw = permutations(workers);
        const pt = permutations(tasks);
        const allSolutions = [];
        for(let i = 0; i < pw.length; i++)for(let j = 0; j < pt.length; j++)allSolutions.push(solve(pw[i], pt[j]));
        sortedSolutions = uniqBy(allSolutions.sort((a, b)=>longestRoute(workers, a) - longestRoute(workers, b)), (s)=>longestRoute(workers, s));
        renderSolution(sortedSolutions === null || sortedSolutions === void 0 ? void 0 : sortedSolutions[0]);
        renderSolutionList();
    });
};
addEventListener("DOMContentLoaded", ()=>{
    start();
});
