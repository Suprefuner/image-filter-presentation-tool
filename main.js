"use strict"

// ELEMENT --------------------------------------------------
const container = document.querySelector(".grid-container")
const displayRGB = document.querySelectorAll(".displayRGB")
const labels = document.querySelectorAll("label")

const btnReset = document.querySelector(".btn__reset")
const btnChange = document.querySelector(".btn__change")
const btnReflect = document.querySelector(".btn__reflect")
const btnBw = document.querySelector(".btn__bw")
const btnBlur = document.querySelector(".btn__blur")
const btnColors = document.querySelectorAll(".color")
const btnBgMusic = document.querySelector(".bg-music-control")

const inputGirdSize = document.querySelector(".input__grid-size")

const bgMusic = document.querySelector(".bg-music")

const styleSheet = document.styleSheets[0]

// VARIABLES --------------------------------------------------
const numberOfColor = 3
let boxColor = 1
let size = 10
let boxSize, gapSize

// BG MUSIC SETTING --------------------------------------------
bgMusic.volume = 0.3
bgMusic.playbackRate = 0.6

// FUNCTION
// Change second color ----------------------------------------
const resetBtnColor = function () {
  btnColors.forEach((btn, i) => {
    btn.classList.remove("current-color", "unpicked-color")
    btnColors[i].classList.add(
      `${i === boxColor - 1 ? "current-color" : "unpicked-color"}`
    )
  })
}

const boxChangeColor = (e) => {
  if (e.target.classList.contains("btn"))
    boxColor = boxColor === btnColors.length ? 1 : +boxColor + +1
  else boxColor = +e.target.dataset.color

  resetBtnColor()
}

btnChange.addEventListener("click", boxChangeColor)
btnColors.forEach((btn) => btn.addEventListener("click", boxChangeColor))

// create boxes ----------------------------------

const createBox = function (size) {
  const numberOfRow = size
  const numberOfCol = size
  let containerSize = 69

  container.innerHTML = ``

  // Get the box size and gap size from style sheet
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    if (styleSheet.cssRules[i].selectorText === ".box") {
      boxSize = styleSheet.cssRules[i]
    }

    if (styleSheet.cssRules[i].selectorText === ":root") {
      gapSize = styleSheet.cssRules[i]
    }
  }

  // Set box size and gap size base on different grid size
  if (size >= 12) {
    containerSize = 49
    gapSize.style.setProperty("--gap-default", ".5rem")
  } else if (size >= 20) {
    containerSize = 69
    gapSize.style.setProperty("--gap-default", ".3rem")
  } else if (size >= 30) {
    containerSize = 69
    gapSize.style.setProperty("--gap-default", "0rem")
  } else if (size >= 40) {
    containerSize = 109
    gapSize.style.setProperty("--gap-default", "0rem")
  }

  // Keep the total grid size around 700px
  boxSize.style.setProperty(
    "width",
    `${Math.round(containerSize - size + 1) / 10}rem`
  )

  // Create grid
  for (let i = 0; i < numberOfRow; i++) {
    const row = document.createElement("div")
    row.classList.add(`row${i}`, "row")
    container.insertAdjacentElement("beforeEnd", row)

    for (let i = 0; i < numberOfCol; i++) {
      const box = document.createElement("div")
      box.classList.add(`box${i}`, `box`)
      row.insertAdjacentElement("beforeEnd", box)
    }
  }
}

createBox(size)

// display box's RGB value ------------------------------
// Help function
// const componentToHex = function (c) {
//   const hex = c.toString(16)
//   return hex.length == 1 ? "0" + hex : hex
// }

// const rgbToHex = function ([...rgb]) {
//   return (
//     "#" +
//     componentToHex(+rgb[0]) +
//     componentToHex(+rgb[1]) +
//     componentToHex(+rgb[2])
//   )
// }

const getRGB = function (el) {
  const style = window.getComputedStyle(el)
  return style.getPropertyValue("background-color").slice(4, -1).split(", ")
}

const displayColor = function (e) {
  const rgb = getRGB(e.target)

  rgb.forEach((rgb, i) => {
    displayRGB[i].value = rgb
  })
}

container.addEventListener("mouseover", function (e) {
  if (e.target.classList.contains("box")) displayColor(e)
})

// Click box to change color --------------------------
const changeColor = function (e) {
  e.target.classList.toggle("clicked")

  e.target.classList.contains("clicked")
    ? e.target.classList.add(`clicked--${boxColor}`)
    : e.target.classList.remove(
        `clicked--1`,
        `clicked--2`,
        "clicked--3",
        "clicked--4"
      )
}

container.addEventListener("click", function (e) {
  if (e.target.classList.contains("box")) changeColor(e)
})

// Reset boxes --------------------------
const boxesReset = function () {
  const boxes = document.querySelectorAll(".box")

  boxes.forEach((box) => {
    box.classList.remove(
      "clicked--2",
      "clicked--1",
      "clicked--3",
      "clicked--4",
      "clicked"
    )
    box.removeAttribute("style")
  })

  // reset color btns
  boxColor = 1
  resetBtnColor()
}

btnReset.addEventListener("click", boxesReset)

// FILTER --------------------------------------------------------------------
// Filter Reflection
const reflection = function () {
  // change node list into real array to use array methods
  const rows = [...document.querySelectorAll(".row")]

  rows.forEach((row) => {
    // change node list into real array to use array methods
    const boxes = [...row.querySelectorAll(".box")]
    let classArr = []
    boxes.forEach((box, i) => {
      classArr[i] = box.classList.value
    })

    classArr = classArr.reverse()
    boxes.forEach((box, i) => (box.classList.value = classArr[i]))
  })
}

btnReflect.addEventListener("click", reflection)

// Filter black and white
const blackWhite = function () {
  // change node list into real array to use array methods
  const rows = [...document.querySelectorAll(".row")]

  rows.forEach((row) => {
    // change node list into real array to use array methods
    const boxes = [...row.querySelectorAll(".box")]

    boxes.forEach((box) => {
      let [r, g, b] = getRGB(box)
      r = g = b = (+r + +g + +b) / 3
      box.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
    })
  })
}

btnBw.addEventListener("click", blackWhite)

// Filter blur
// helper function
const calcBlurRGB = (arr, color) =>
  arr.reduce((avg, box, _, arr) => (avg += box[color] / arr.length), 0)

const insertNewBlurRGB = (fromArr, toArr) => {
  for (let i = 0; i < toArr.length; i++) toArr[i] = fromArr[i]
}

const blur = function () {
  // 1) create copy -> 2) calc new rgb value -> 3) put new value to element
  // 1) create copy
  const imageCopy = []
  const rows = [...document.querySelectorAll(".row")]

  rows.forEach((row, i) => {
    const boxes = [...row.querySelectorAll(".box")]
    imageCopy[i] = [] // have to set imageCopy[i] as an array first
    boxes.forEach((box, j) => (imageCopy[i][j] = getRGB(box)))
  })

  // 2) calc new rgb value
  imageCopy.forEach((row, i) => {
    row.forEach((_, j) => {
      // 4 corners
      if (
        (i === 0 && j === 0) ||
        (i === 0 && j === row.length - 1) ||
        (i === imageCopy.length - 1 && j === 0) ||
        (i === imageCopy.length - 1 && j === row.length - 1)
      ) {
        const nextRow = i === 0 ? i + 1 : i - 1
        const next = j === 0 ? j + 1 : j - 1

        const surroundBoxes = [
          imageCopy[i][j],
          imageCopy[i][next],
          imageCopy[nextRow][j],
          imageCopy[nextRow][next],
        ]

        const surroundBoxesR = calcBlurRGB(surroundBoxes, 0)
        const surroundBoxesG = calcBlurRGB(surroundBoxes, 1)
        const surroundBoxesB = calcBlurRGB(surroundBoxes, 2)

        const rgb = [surroundBoxesR, surroundBoxesG, surroundBoxesB]

        insertNewBlurRGB(rgb, imageCopy[i][j])
      }

      // lefe and right edge
      else if (
        (i !== 0 && i !== imageCopy.length - 1 && j === 0) ||
        (i !== 0 && i !== imageCopy.length - 1 && j === row.length - 1)
      ) {
        const prevRow = i - 1
        const nextRow = i + 1
        const next = j === 0 ? j + 1 : j - 1

        const surroundBoxes = [
          imageCopy[i][j],
          imageCopy[i][next],
          imageCopy[prevRow][j],
          imageCopy[prevRow][next],
          imageCopy[nextRow][j],
          imageCopy[nextRow][next],
        ]

        const surroundBoxesR = calcBlurRGB(surroundBoxes, 0)
        const surroundBoxesG = calcBlurRGB(surroundBoxes, 1)
        const surroundBoxesB = calcBlurRGB(surroundBoxes, 2)

        const rgb = [surroundBoxesR, surroundBoxesG, surroundBoxesB]

        insertNewBlurRGB(rgb, imageCopy[i][j])
      }

      // center
      if (
        i !== 0 &&
        i !== imageCopy.length - 1 &&
        j !== 0 &&
        j !== row.length - 1
      ) {
        const prevRow = i - 1
        const nextRow = i + 1
        const prev = j - 1
        const next = j + 1

        const surroundBoxes = [
          imageCopy[i][j],
          imageCopy[i][prev],
          imageCopy[i][next],
          imageCopy[prevRow][j],
          imageCopy[prevRow][prev],
          imageCopy[prevRow][next],
          imageCopy[nextRow][j],
          imageCopy[nextRow][prev],
          imageCopy[nextRow][next],
        ]

        const surroundBoxesR = calcBlurRGB(surroundBoxes, 0)
        const surroundBoxesG = calcBlurRGB(surroundBoxes, 1)
        const surroundBoxesB = calcBlurRGB(surroundBoxes, 2)

        const rgb = [surroundBoxesR, surroundBoxesG, surroundBoxesB]

        insertNewBlurRGB(rgb, imageCopy[i][j])
      }
    })
  })

  // 3) put new value to element
  rows.forEach((row, i) => {
    const boxes = [...row.querySelectorAll(".box")]
    boxes.forEach((box, j) => {
      box.style.backgroundColor = `rgb(${+imageCopy[i][j][0]},${+imageCopy[i][
        j
      ][1]},${+imageCopy[i][j][2]})`
    })
  })
}

btnBlur.addEventListener("click", blur)

inputGirdSize.addEventListener("keyup", function (e) {
  if (e.key === "Enter") createBox(+inputGirdSize.value)
})

// control bg-music -------------------------------------
const controlMusic = function (e) {
  const button = e.target.closest(".bg-music-control")

  if (button.classList.contains("music-play")) {
    bgMusic.pause()
    button.innerHTML = `<i class="fas fa-volume-mute"></i>`
  } else {
    bgMusic.play()
    button.innerHTML = `<i class="fas fa-volume-up"></i>`
  }
  button.classList.toggle("music-play")
}

btnBgMusic.addEventListener("click", controlMusic)
