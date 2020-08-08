import { toRefs, h, computed, markRaw } from 'vue'
import useVuelidate from 'vuelidate'

export default function VuelidatePlugin (baseReturns) {
  // Take the parsed schema from SchemaForm setup returns
  const { parsedSchema } = baseReturns

  // Wrap all components with the "withVuelidate" component
  const schemaWithVuelidate = computed(() => parsedSchema.value.map(el => {
    return {
      ...el,
      component: markRaw(withVuelidate(el.component))
    }
  }))

  return {
    ...baseReturns,
    parsedSchema: schemaWithVuelidate
  }
}

export function withVuelidate (Comp) {
  return {
    setup (props, { attrs }) {
      const { validations, modelValue, model } = toRefs(props)
      const propertyName = model.value

      // Setup validation results for that schema leaf
      const vResults = useVuelidate(
        { [propertyName]: validations.value },
        { [propertyName]: modelValue }
      )

      return {
        vResults,
        props,
        attrs
      }
    },
    render () {
      // It renders the original component with the
      // validation results as props
      return h(Comp, {
        ...this.props,
        ...this.attrs,
        vResults: this.vResults
      })
    }
  }
}
