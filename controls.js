class Controls {
	constructor() {
		this.forward = false;
		this.left = false;
		this.right = false;
		this.reverse = false;

		//we have added #because this is a private method;
		this.#addKeyboardListners();
	}

	#addKeyboardListners() {
		//this is function which will be clicked when the arrow keys will be pressed;
		document.onkeydown = (event) => {
			switch (event.key) {
				case "ArrowLeft":
					this.left = true;
					break;
				case "ArrowRight":
					this.right = true;
					break;
				case "ArrowUp":
					this.forward = true;
					break;
				case "ArrowDown":
					this.reverse = true;
					break;
			}
			//this is for debugging this will print entire table on the action
			console.table(this);
		};

		//this is function which will be clicked when the arrow keys will be released;

		document.onkeyup = (event) => {
			switch (event.key) {
				case "ArrowLeft":
					this.left = false;
					break;
				case "ArrowRight":
					this.right = false;
					break;
				case "ArrowUp":
					this.forward = false;
					break;
				case "ArrowDown":
					this.reverse = false;
					break;
			}
			//this is for debugging this will print entire table on the action
			console.table(this);
		};
	}
}
