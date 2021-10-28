<?php

namespace backend\models; {
    class LanguageDetails
    {
        /**  Location for overloaded data.  */
        private $data = array();

        //** Name; NativeName; Dir */
        public function __get($name)
        {
            if (array_key_exists($name, $this->data)) {
                return $this->data[$name];
            }

            $trace = debug_backtrace();
            trigger_error(
                'Undefined property via __get(): ' . $name .
                    ' in ' . $trace[0]['file'] .
                    ' on line ' . $trace[0]['line'],
                E_USER_NOTICE
            );
            return null;
        }
        public function __set($name, $value)
        {
            $this->data[$name] = $value;
        }
    }
}
