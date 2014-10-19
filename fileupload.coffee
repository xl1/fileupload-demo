HTMLCanvasElement::toBlob ?= (cb, type, encOption) ->
  base64 = @toDataURL(type, encOption).split(',')[1]
  binary = atob base64
  bytes = new Uint8Array binary.length
  for i in [0...binary.length] by 1
    bytes[i] = binary.charCodeAt i
  cb(new Blob [bytes.buffer], { type })


class IFileSelector
  get: ->
    # () -> Promise<Blob>


class FileSelector extends IFileSelector
  constructor: (@el) ->
    @el.addEventListener 'change', =>
      if @el.files.length
        @_resolve? @el.files[0]
      else
        @_reject?()

  get: ->
    new Promise (@_resolve, @_reject) => @el.click()

class DragDropSelector extends IFileSelector
  constructor: (@el) ->
    @el.addEventListener 'dragover', (e) ->
      e.stopPropagation()
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    @el.addEventListener 'drop', (e) =>
      e.stopPropagation()
      e.preventDefault()
      files = e.dataTransfer.files
      if files.length
        @_resolve? files[0]

  get: ->
    new Promise (@_resolve, @_reject) =>

window.FileUpload = {
  FileSelector
  DragDropSelector
}
